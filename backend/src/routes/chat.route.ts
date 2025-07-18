// this will allow for messages on db to be printed on the browser ..

import { FastifyInstance } from 'fastify';
import { getMessages } from '../services/chat.service';

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get('/messages', async (request, reply) => {
    const messages = await getMessages();
    return messages;
  });
}
