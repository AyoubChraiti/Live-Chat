const { databaseService } = require('../services/database.service');
const { broadcastToUser } = require('../handlers/websocket.handler');

async function gameRoutes(fastify) {
  // Send game invitation
  fastify.post('/api/game-invite', async (request, reply) => {
    const { senderId, receiverId } = request.body;

    try {
      // Check if sender is blocked by receiver
      const blocked = await databaseService.isBlocked(receiverId, senderId);
      
      if (blocked) {
        reply.code(403).send({ error: 'Cannot send invitation to this user' });
        return;
      }

      const inviteId = await databaseService.createGameInvitation(senderId, receiverId);
      
      // Notify receiver via WebSocket
      const sender = await databaseService.getUserById(senderId);
      if (sender) {
        broadcastToUser(receiverId, {
          type: 'game_invitation',
          inviteId,
          senderId,
          senderUsername: sender.username
        });
      }

      reply.send({ success: true, inviteId });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to send invitation' });
    }
  });

  // Respond to game invitation
  fastify.post('/api/game-invite/respond', async (request, reply) => {
    const { inviteId, status } = request.body;

    try {
      await databaseService.updateGameInvitationStatus(inviteId, status);
      
      // Notify sender
      const invite = await databaseService.getGameInvitation(inviteId);
      if (invite) {
        broadcastToUser(invite.sender_id, {
          type: 'game_invitation_response',
          inviteId,
          status,
          opponentId: invite.receiver_id
        });
      }

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to respond to invitation' });
    }
  });

  // Create tournament
  fastify.post('/api/tournament', async (request, reply) => {
    const { name, participants } = request.body;

    try {
      const tournamentId = await databaseService.createTournament(name, participants);
      reply.send({ success: true, tournamentId });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create tournament' });
    }
  });

  // Notify next tournament match
  fastify.post('/api/tournament/:id/notify', async (request, reply) => {
    const { id } = request.params;
    const { player1Id, player2Id, round } = request.body;

    try {
      const tournament = await databaseService.getTournament(parseInt(id));
      
      if (!tournament) {
        reply.code(404).send({ error: 'Tournament not found' });
        return;
      }

      const notification = {
        type: 'tournament_match',
        tournamentId: parseInt(id),
        tournamentName: tournament.name,
        round
      };

      broadcastToUser(player1Id, { ...notification, opponentId: player2Id });
      broadcastToUser(player2Id, { ...notification, opponentId: player1Id });

      reply.send({ success: true });
    } catch (error) {
      reply.code(404).send({ error: 'Tournament not found' });
    }
  });
}

module.exports = { gameRoutes };
