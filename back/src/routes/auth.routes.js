const { databaseService } = require('../services/database.service');
const { hashPassword } = require('../utils/crypto');

async function authRoutes(fastify) {
  // usr regis
  fastify.post('/api/register', async (request, reply) => {
    const { username, password } = request.body;
    const hashedPassword = hashPassword(password);

    try {
      const id = await databaseService.createUser(username, hashedPassword);
      reply.send({ id, username });
    } catch (error) {
      reply.code(400).send({ error: 'Username already exists' });
    }
  });

  // urs login
  fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body;
    const hashedPassword = hashPassword(password);

    try {
      const user = await databaseService.getUserByCredentials(username, hashedPassword);
      
      if (!user) {
        reply.code(401).send({ error: 'Invalid credentials' });
        return;
      }

      await databaseService.updateUserStatus(user.id, 'online');
      reply.send({ id: user.id, username: user.username });
    } catch (error) {
      reply.code(401).send({ error: 'Invalid credentials' });
    }
  });
}

module.exports = { authRoutes };
