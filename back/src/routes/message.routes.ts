import type { FastifyInstance } from 'fastify';
import { databaseService } from '../services/database.service';

export async function messageRoutes(fastify: FastifyInstance) {
  // Get conversation history
  fastify.get('/api/messages/:userId/:otherUserId', async (request, reply) => {
    const { userId, otherUserId } = request.params as { userId: string; otherUserId: string };

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
