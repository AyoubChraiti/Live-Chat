import app from './app';
import { setupWebSocket } from './sockets/chat.socket';

const start = async () => {
  try {
    const address = await app.listen({ port: 3000 });
    console.log(`✅ Server running at ${address}`);

    // Get the raw Node HTTP server from Fastify
    const httpServer = app.server;

    // Attach WebSocket server
    setupWebSocket(httpServer);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
