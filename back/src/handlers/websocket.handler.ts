import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import { databaseService } from '../services/database.service';
import { WebSocketMessage } from '../types';

// ws connections store
const connections = new Map<number, WebSocket>();

export function broadcastToUser(userId: number, data: any): void {
  const userIdNum = parseInt(String(userId));
  const conn = connections.get(userIdNum);
  
  console.log(`Broadcasting to user ${userIdNum}:`, data.type);
  console.log(`Connection exists:`, !!conn);
  console.log(`Connection ready:`, conn?.readyState === 1);
  console.log(`All connections:`, Array.from(connections.keys()));
  
  if (conn && conn.readyState === 1) {
    conn.send(JSON.stringify(data));
    console.log(`Message sent to user ${userIdNum}`);
  } else {
    console.log(`Cannot send to user ${userIdNum} - not connected`);
  }
}

export function setupWebSocket(fastify: FastifyInstance): void {
  fastify.register(async function(fastify) {
    fastify.get('/ws', { websocket: true }, (connection, _req) => {
      connection.socket.on('message', async (message: Buffer) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          const { type, userId, receiverId, content, tempId } = data;

          if (type === 'auth') {
            if (userId) {
              connections.set(userId, connection.socket);
              console.log(`User ${userId} connected`);
              await databaseService.updateUserStatus(userId, 'online');
            }
            return;
          }

          const senderId = Array.from(connections.keys()).find(
            key => connections.get(key) === connection.socket
          );

          if (!senderId) { // in case sm1 sends from terminal .
            connection.socket.send(
              JSON.stringify({ type: 'error', message: 'Authentication required' })
            );
            return;
          }

          if (type === 'message' && receiverId && content) {
            // check for blocking in both directions
            const senderBlockedByReceiver = await databaseService.isBlocked(receiverId, senderId);
            const receiverBlockedBySender = await databaseService.isBlocked(senderId, receiverId);
            
            if (senderBlockedByReceiver || receiverBlockedBySender) {
              connection.socket.send(
                JSON.stringify({ type: 'error', message: 'Cannot send message to this user.' })
              );
              return;
            }

            const messageId = await databaseService.createMessage(senderId, receiverId, content);
            const newMessage = await databaseService.getMessageById(messageId);

            if (newMessage) {
              const receiverSocket = connections.get(receiverId);
              if (receiverSocket) {
                receiverSocket.send(
                  JSON.stringify({
                    type: 'message',
                    ...newMessage,
                    senderId: senderId,
                    receiverId: receiverId
                  })
                );
              }

              connection.socket.send(
                JSON.stringify({
                  type: 'message_confirmed',
                  tempId: tempId,
                  ...newMessage
                })
              );
            }
          }
          // idnt think this is used ig. 
          else if (type === 'typing' && receiverId !== undefined) {
            const receiverSocket = connections.get(receiverId);
            if (receiverSocket) {
              receiverSocket.send(
                JSON.stringify({
                  type: 'typing',
                  senderId,
                  isTyping: data.isTyping
                })
              );
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      connection.socket.on('close', async () => {
        for (let [userId, socket] of connections.entries()) {
          if (socket === connection.socket) {
            connections.delete(userId);
            console.log(`User ${userId} disconnected`);
            await databaseService.updateUserStatus(userId, 'offline');
            break;
          }
        }
      });
    });
  });
}

export { connections };
