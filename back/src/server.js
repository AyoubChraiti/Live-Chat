const fastify = require('fastify');
const fastifyWebsocket = require('@fastify/websocket');
const fastifyCors = require('@fastify/cors');
const { config } = require('./config');
const { setupWebSocket } = require('./handlers/websocket.handler');
const { authRoutes } = require('./routes/auth.routes');
const { userRoutes } = require('./routes/user.routes');
const { messageRoutes } = require('./routes/message.routes');
const { gameRoutes } = require('./routes/game.routes');

const server = fastify({ logger: false });

server.register(fastifyCors, {
  origin: config.corsOrigins,
  credentials: true
});

server.register(fastifyWebsocket);

setupWebSocket(server);

server.register(authRoutes);
server.register(userRoutes);
server.register(messageRoutes);
server.register(gameRoutes);

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
