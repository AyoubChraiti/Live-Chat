export interface User {
  id: number;
  username: string;
  status?: 'online' | 'offline' | 'away';
  isBlocked?: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
  senderUsername?: string;
  tempId?: string;
}

export interface WebSocketMessage {
  type: 'auth' | 'message' | 'message_confirmed' | 'typing' | 'error' | 'game_invitation' | 'game_invitation_response' | 'tournament_match';
  userId?: number;
  id?: number;
  sender_id?: number;
  receiver_id?: number;
  senderId?: number;
  receiverId?: number;
  message?: string;
  content?: string;
  timestamp?: string;
  senderUsername?: string;
  tempId?: string;
  isTyping?: boolean;
  inviteId?: number;
  status?: string;
  tournamentName?: string;
  round?: number;
}

export interface GameInvitation {
  inviteId: number;
  senderUsername: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  actions?: NotificationAction[];
  type?: 'info' | 'success' | 'warning' | 'game';
}

export interface NotificationAction {
  text: string;
  class: string;
  action: () => void;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
