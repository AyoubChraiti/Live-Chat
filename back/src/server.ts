import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { config } from './config';
import { setupWebSocket } from './handlers/websocket.handler';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { messageRoutes } from './routes/message.routes';
import { gameRoutes } from './routes/game.routes';

const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: config.corsOrigins,
  credentials: true
});

server.register(fastifyWebsocket);

// Setup WebSocket handler
setupWebSocket(server);

// Register routes
server.register(authRoutes);
server.register(userRoutes);
server.register(messageRoutes);
server.register(gameRoutes);

// server
const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
    console.log(`Server running on http://${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
