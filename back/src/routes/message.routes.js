const { databaseService } = require('../services/database.service');

async function messageRoutes(fastify) {
  // Get conversation history
  fastify.get('/api/messages/:userId/:otherUserId', async (request, reply) => {
    const { userId, otherUserId } = request.params;

    try {
      const messages = await databaseService.getConversation(
        parseInt(userId),
        parseInt(otherUserId)
      );
      reply.send(messages);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch messages' });
    }
  });
}

module.exports = { messageRoutes };
