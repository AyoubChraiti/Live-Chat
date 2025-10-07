const fastify = require('fastify')({ logger: true });
const fastifyWebsocket = require('@fastify/websocket');
const fastifyStatic = require('@fastify/static');
const fastifyCors = require('@fastify/cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// Initialize database
const db = new sqlite3.Database('./chat.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'offline',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  )`);

  // Blocked users table
  db.run(`CREATE TABLE IF NOT EXISTS blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users(id),
    FOREIGN KEY (blocked_id) REFERENCES users(id),
    UNIQUE(blocker_id, blocked_id)
  )`);

  // Game invitations table
  db.run(`CREATE TABLE IF NOT EXISTS game_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  )`);

  // Tournament table
  db.run(`CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    current_round INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tournament participants table
  db.run(`CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    position INTEGER,
    next_match_id INTEGER,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

// WebSocket connections store
const connections = new Map();

// Register plugins
fastify.register(fastifyCors, {
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3002', 'http://127.0.0.1:3002'], // Allow Vite dev server on multiple ports
  credentials: true
});

fastify.register(fastifyWebsocket);

// Remove static file serving since Vite will handle the frontend

// Helper functions
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isBlocked(blockerId, blockedId, callback) {
  db.get(
    'SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
    [blockerId, blockedId],
    (err, row) => {
      callback(err, !!row);
    }
  );
}

function broadcastToUser(userId, data) {
  // Ensure userId is converted to number for consistency
  const userIdNum = parseInt(userId);
  const conn = connections.get(userIdNum);
  console.log(`📡 Broadcasting to user ${userIdNum} (original: ${userId}):`, data.type);
  console.log(`🔗 Connection exists:`, !!conn);
  console.log(`🔗 Connection ready:`, conn?.readyState === 1);
  console.log(`🗺️ All connections:`, Array.from(connections.keys()));
  
  if (conn && conn.readyState === 1) {
    conn.send(JSON.stringify(data));
    console.log(`✅ Message sent to user ${userIdNum}`);
  } else {
    console.log(`❌ Cannot send to user ${userIdNum} - not connected`);
  }
}

// WebSocket route for real-time chat
fastify.register(async function(fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const { type, userId, receiverId, content, tempId } = data;

        if (type === 'auth') {
          connections.set(userId, connection.socket);
          console.log(`User ${userId} connected`);
          // Optionally, set user status to 'online'
          db.run('UPDATE users SET status = ? WHERE id = ?', ['online', userId]);
          return;
        }

        const senderId = Array.from(connections.keys()).find(key => connections.get(key) === connection.socket);
        if (!senderId) {
          connection.socket.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
          return;
        }

        if (type === 'message') {
          // Check for blocking
          isBlocked(receiverId, senderId, (blocked) => {
            if (blocked) {
              connection.socket.send(JSON.stringify({ type: 'error', message: 'You are blocked by this user.' }));
              return;
            }

            const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)');
            stmt.run(senderId, receiverId, content, function (err) {
              if (err) {
                console.error('Failed to save message:', err);
                return;
              }

              const messageId = this.lastID;
              db.get('SELECT * FROM messages WHERE id = ?', [messageId], (err, newMessage) => {
                if (err) {
                  console.error('Failed to retrieve message:', err);
                  return;
                }

                const receiverSocket = connections.get(receiverId);
                if (receiverSocket) {
                  receiverSocket.send(JSON.stringify({ type: 'message', ...newMessage, senderId: senderId, receiverId: receiverId }));
                }
                connection.socket.send(JSON.stringify({ type: 'message_confirmed', tempId: tempId, ...newMessage }));
              });
            });
          });
        } else if (type === 'typing') {
            const receiverSocket = connections.get(receiverId);
            if (receiverSocket) {
                receiverSocket.send(JSON.stringify({ type: 'typing', senderId, isTyping: data.isTyping }));
            }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    connection.socket.on('close', () => {
      for (let [userId, socket] of connections.entries()) {
        if (socket === connection.socket) {
          connections.delete(userId);
          console.log(`User ${userId} disconnected`);
          // Optionally, set user status to 'offline'
          db.run('UPDATE users SET status = ? WHERE id = ?', ['offline', userId]);
          break;
        }
      }
    });
  });
});

// API routes
fastify.register(async function (fastify) {
  // User registration
  fastify.post('/api/register', (req, reply) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          reply.code(400).send({ error: 'Username already exists' });
        } else {
          reply.send({ id: this.lastID, username });
        }
      }
    );
  });

  // User login
  fastify.post('/api/login', (req, reply) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);

    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, hashedPassword],
      (err, user) => {
        if (err || !user) {
          reply.code(401).send({ error: 'Invalid credentials' });
        } else {
          db.run('UPDATE users SET status = ? WHERE id = ?', ['online', user.id]);
          reply.send({ id: user.id, username: user.username });
        }
      }
    );
  });

  // Get user profile
  fastify.get('/api/users/:id', (req, reply) => {
    const { id } = req.params;

    db.get(
      'SELECT id, username, bio, avatar, status, created_at FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err || !user) {
          reply.code(404).send({ error: 'User not found' });
        } else {
          reply.send(user);
        }
      }
    );
  });

  // Update user profile
  fastify.put('/api/users/:id', (req, reply) => {
    const { id } = req.params;
    const { bio, avatar } = req.body;

    db.run(
      'UPDATE users SET bio = ?, avatar = ? WHERE id = ?',
      [bio, avatar, id],
      function(err) {
        if (err) {
          reply.code(500).send({ error: 'Failed to update profile' });
        } else {
          reply.send({ success: true });
        }
      }
    );
  });

  // Get all users
  fastify.get('/api/users', (req, reply) => {
    db.all(
      'SELECT id, username, status FROM users',
      [],
      (err, users) => {
        if (err) {
          reply.code(500).send({ error: 'Failed to fetch users' });
        } else {
          reply.send(users);
        }
      }
    );
  });

  // Get conversation history
  fastify.get('/api/messages/:userId/:otherUserId', (req, reply) => {
    const { userId, otherUserId } = req.params;

    db.all(
      `SELECT m.*, u.username as sender_username 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId, otherUserId, userId],
      (err, messages) => {
        if (err) {
          reply.code(500).send({ error: 'Failed to fetch messages' });
        } else {
          reply.send(messages);
        }
      }
    );
  });

  // Block user
  fastify.post('/api/block', (req, reply) => {
    const { blockerId, blockedId } = req.body;

    db.run(
      'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
      [blockerId, blockedId],
      function(err) {
        if (err) {
          reply.code(400).send({ error: 'Failed to block user' });
        } else {
          reply.send({ success: true });
        }
      }
    );
  });

  // Unblock user
  fastify.post('/api/unblock', (req, reply) => {
    const { blockerId, blockedId } = req.body;

    db.run(
      'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      [blockerId, blockedId],
      function(err) {
        if (err) {
          reply.code(500).send({ error: 'Failed to unblock user' });
        } else {
          reply.send({ success: true });
        }
      }
    );
  });

  // Get blocked users
  fastify.get('/api/blocked/:userId', (req, reply) => {
    const { userId } = req.params;

    db.all(
      `SELECT u.id, u.username FROM users u
       JOIN blocked_users b ON u.id = b.blocked_id
       WHERE b.blocker_id = ?`,
      [userId],
      (err, users) => {
        if (err) {
          reply.code(500).send({ error: 'Failed to fetch blocked users' });
        } else {
          reply.send(users);
        }
      }
    );
  });

  // Send game invitation
  fastify.post('/api/game-invite', (req, reply) => {
    const { senderId, receiverId } = req.body;

    db.run(
      'INSERT INTO game_invitations (sender_id, receiver_id) VALUES (?, ?)',
      [senderId, receiverId],
      function(err) {
        if (err) {
          reply.code(500).send({ error: 'Failed to send invitation' });
        } else {
          const inviteId = this.lastID;
          
          // Notify receiver via WebSocket
          db.get('SELECT username FROM users WHERE id = ?', [senderId], (err, sender) => {
            broadcastToUser(receiverId, {
              type: 'game_invitation',
              inviteId,
              senderId,
              senderUsername: sender.username
            });
          });

          reply.send({ success: true, inviteId });
        }
      }
    );
  });

  // Respond to game invitation
  fastify.post('/api/game-invite/respond', (req, reply) => {
    const { inviteId, status } = req.body;

    db.run(
      'UPDATE game_invitations SET status = ? WHERE id = ?',
      [status, inviteId],
      function(err) {
        if (err) {
          reply.code(500).send({ error: 'Failed to respond to invitation' });
        } else {
          // Notify sender
          db.get('SELECT sender_id, receiver_id FROM game_invitations WHERE id = ?', [inviteId], (err, invite) => {
            if (invite) {
              broadcastToUser(invite.sender_id, {
                type: 'game_invitation_response',
                inviteId,
                status,
                opponentId: invite.receiver_id
              });
            }
          });

          reply.send({ success: true });
        }
      }
    );
  });

  // Create tournament
  fastify.post('/api/tournament', (req, reply) => {
    const { name, participants } = req.body;

    db.run(
      'INSERT INTO tournaments (name, status) VALUES (?, ?)',
      [name, 'pending'],
      function(err) {
        if (err) {
          reply.code(500).send({ error: 'Failed to create tournament' });
        } else {
          const tournamentId = this.lastID;

          // Add participants
          const stmt = db.prepare('INSERT INTO tournament_participants (tournament_id, user_id, position) VALUES (?, ?, ?)');
          participants.forEach((userId, index) => {
            stmt.run(tournamentId, userId, index + 1);
          });
          stmt.finalize();

          reply.send({ success: true, tournamentId });
        }
      }
    );
  });

  // Notify next tournament match
  fastify.post('/api/tournament/:id/notify', (req, reply) => {
    const { id } = req.params;
    const { player1Id, player2Id, round } = req.body;

    // Notify both players
    db.get('SELECT name FROM tournaments WHERE id = ?', [id], (err, tournament) => {
      if (tournament) {
        const notification = {
          type: 'tournament_match',
          tournamentId: id,
          tournamentName: tournament.name,
          round,
          opponentId: player2Id
        };

        broadcastToUser(player1Id, { ...notification, opponentId: player2Id });
        broadcastToUser(player2Id, { ...notification, opponentId: player1Id });

        reply.send({ success: true });
      } else {
        reply.code(404).send({ error: 'Tournament not found' });
      }
    });
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();