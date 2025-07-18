import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { saveMessage } from '../services/chat.service';

const clients = new Set<WebSocket>();

export const setupWebSocket = (server: import('http').Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('🟢 Client connected');
    clients.add(ws);

    ws.on('message', async (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString());
        const { sender, content } = parsed;

        // Save to DB
        await saveMessage(sender, content);

        // Broadcast to all clients
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ sender, content, timestamp: new Date() }));
          }
        }
      } catch (err) {
        console.error('Failed to handle message:', err);
      }
    });

    ws.on('close', () => {
      console.log('🔴 Client disconnected');
      clients.delete(ws);
    });
  });
};
