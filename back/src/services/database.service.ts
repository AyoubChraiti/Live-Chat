import sqlite3 from 'sqlite3';
import { config } from '../config';
import {
  User,
  Message,
  GameInvitation,
  Tournament
} from '../types';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(config.dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.serialize(() => {
      // Users table
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'offline',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Messages table
      this.db.run(`CREATE TABLE IF NOT EXISTS messages (
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
      this.db.run(`CREATE TABLE IF NOT EXISTS blocked_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blocker_id INTEGER NOT NULL,
        blocked_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blocker_id) REFERENCES users(id),
        FOREIGN KEY (blocked_id) REFERENCES users(id),
        UNIQUE(blocker_id, blocked_id)
      )`);

      // Game invitations table
      this.db.run(`CREATE TABLE IF NOT EXISTS game_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )`);

      // Tournament table
      this.db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        current_round INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tournament participants table
      this.db.run(`CREATE TABLE IF NOT EXISTS tournament_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        position INTEGER,
        next_match_id INTEGER,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
    });
  }

  // User operations
  createUser(username: string, hashedPassword: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getUserByCredentials(username: string, hashedPassword: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, hashedPassword],
        (err, row: User) => {
          if (err)
            reject(err);
          else
            resolve(row);
        }
      );
    });
  }

  getUserById(id: number): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, bio, avatar, status, created_at FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err)
            reject(err);
          else 
            resolve(row);
        }
      );
    });
  }

  getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, username, status FROM users',
        [],
        (err, rows: User[]) => {
          if (err)
            reject(err);
          else 
            resolve(rows);
        }
      );
    });
  }

  updateUserProfile(id: number, bio: string, avatar: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET bio = ?, avatar = ? WHERE id = ?',
        [bio, avatar, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  updateUserStatus(id: number, status: 'online' | 'offline'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Message operations
  createMessage(senderId: number, receiverId: number, content: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getMessageById(id: number): Promise<Message | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM messages WHERE id = ?',
        [id],
        (err, row: Message) => {
          if (err)
            reject(err);
          else
            resolve(row);
        }
      );
    });
  }

  getConversation(userId1: number, userId2: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT m.*, u.username as sender_username 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) 
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC`,
        [userId1, userId2, userId2, userId1],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Blocking operations
  isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
        [blockerId, blockedId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }

  blockUser(blockerId: number, blockedId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
        [blockerId, blockedId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  unblockUser(blockerId: number, blockedId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
        [blockerId, blockedId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  getBlockedUsers(userId: number): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.id, u.username FROM users u
         JOIN blocked_users b ON u.id = b.blocked_id
         WHERE b.blocker_id = ?`,
        [userId],
        (err, rows: User[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Game invitation operations
  createGameInvitation(senderId: number, receiverId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO game_invitations (sender_id, receiver_id) VALUES (?, ?)',
        [senderId, receiverId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  updateGameInvitationStatus(inviteId: number, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE game_invitations SET status = ? WHERE id = ?',
        [status, inviteId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  getGameInvitation(inviteId: number): Promise<GameInvitation | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT sender_id, receiver_id FROM game_invitations WHERE id = ?',
        [inviteId],
        (err, row: GameInvitation) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Tournament operations
  async createTournament(name: string, participants: number[]): Promise<number> {
    const tournamentId = await new Promise<number>((resolve, reject) => {
      this.db.run(
        'INSERT INTO tournaments (name, status) VALUES (?, ?)',
        [name, 'pending'],
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const stmt = this.db.prepare(
      'INSERT INTO tournament_participants (tournament_id, user_id, position) VALUES (?, ?, ?)'
    );

    for (let i = 0; i < participants.length; i++) {
      stmt.run(tournamentId, participants[i], i + 1);
    }

    return new Promise<number>((resolve, reject) => {
      stmt.finalize((err: Error | null) => {
        if (err) reject(err);
        else resolve(tournamentId);
      });
    });
  }

  getTournament(id: number): Promise<Tournament | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT name FROM tournaments WHERE id = ?',
        [id],
        (err, row: Tournament) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }
}

export const databaseService = new DatabaseService();
