import app from './app';
import { setupWebSocket } from './sockets/chat.socket';

const start = async () => {
  try {
    const address = await app.listen({ port: 3000 }); // all interfaces..
    console.log(`✅ Server running at ${address}`);

    // get the raw Node HTTP server from fastify
    const httpServer = app.server;

    // Attach ws server
    setupWebSocket(httpServer);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
