import type { FastifyInstance } from 'fastify';
import { databaseService } from '../services/database.service';

export async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get('/api/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const user = await databaseService.getUserById(parseInt(id));
      
      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      reply.send(user);
    } catch (error) {
      reply.code(404).send({ error: 'User not found' });
    }
  });

  // Update user profile
  fastify.put('/api/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { bio, avatar } = request.body as { bio: string; avatar: string };

    try {
      await databaseService.updateUserProfile(parseInt(id), bio, avatar);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update profile' });
    }
  });

  // Get all users
  fastify.get('/api/users', async (_request, reply) => {
    try {
      const users = await databaseService.getAllUsers();
      reply.send(users);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch users' });
    }
  });

  // Block user
  fastify.post('/api/block', async (request, reply) => {
    const { blockerId, blockedId } = request.body as { blockerId: number; blockedId: number };

    try {
      await databaseService.blockUser(blockerId, blockedId);
      reply.send({ success: true });
    } catch (error) {
      reply.code(400).send({ error: 'Failed to block user' });
    }
  });

  // Unblock user
  fastify.post('/api/unblock', async (request, reply) => {
    const { blockerId, blockedId } = request.body as { blockerId: number; blockedId: number };

    try {
      await databaseService.unblockUser(blockerId, blockedId);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to unblock user' });
    }
  });

  // Get blocked users
  fastify.get('/api/blocked/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    try {
      const users = await databaseService.getBlockedUsers(parseInt(userId));
      reply.send(users);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch blocked users' });
    }
  });
}
