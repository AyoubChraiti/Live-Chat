import type { WebSocket } from 'ws';

export interface User {
  id: number;
  username: string;
  password: string;
  bio?: string;
  avatar?: string;
  status: 'online' | 'offline';
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: string;
  created_at: string;
}

export interface BlockedUser {
  id: number;
  blocker_id: number;
  blocked_id: number;
  created_at: string;
}

export interface GameInvitation {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'completed';
  current_round: number;
  created_at: string;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  user_id: number;
  position?: number;
  next_match_id?: number;
}

export interface WebSocketMessage {
  type: 'auth' | 'message' | 'typing' | 'error' | 'game_invitation' | 'game_invitation_response' | 'tournament_match';
  userId?: number;
  receiverId?: number;
  content?: string;
  tempId?: string;
  isTyping?: boolean;
  [key: string]: any;
}

export interface ConnectionStore {
  get(userId: number): WebSocket | undefined;
  set(userId: number, socket: WebSocket): void;
  delete(userId: number): void;
  entries(): IterableIterator<[number, WebSocket]>;
  keys(): IterableIterator<number>;
}

export type UserPublic = Omit<User, 'password'>;
