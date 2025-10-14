import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketMessage, ConnectionStatus } from '../types';

const WS_URL = 'ws://localhost:3000/ws';

interface UseWebSocketProps {
  userId: number | null;
  onMessage: (message: WebSocketMessage) => void;
}

export const useWebSocket = ({ userId, onMessage }: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    if (!userId || isConnectingRef.current) return;

    isConnectingRef.current = true;
    setConnectionStatus('connecting');

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      isConnectingRef.current = false;
      setConnectionStatus('connected');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Authenticate
      ws.send(JSON.stringify({ type: 'auth', userId }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnectingRef.current = false;
      setConnectionStatus('disconnected');
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code);
      isConnectingRef.current = false;
      setConnectionStatus('disconnected');

      // Auto-reconnect if it wasn't a clean close
      if (userId && !event.wasClean) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      }
    };
  }, [userId, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    sendMessage,
    connectionStatus,
    reconnect: connect,
  };
};
