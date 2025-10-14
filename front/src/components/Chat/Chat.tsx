import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { User, Message, WebSocketMessage, Notification as NotificationType } from '../../types';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Modal } from '../ui/Modal';
import { Notification } from '../ui/Notification';
import { Icons } from '../ui/Icons';

const API_URL = 'http://localhost:3000/api';

export const Chat = () => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [tempMessageCounter, setTempMessageCounter] = useState(0);

  // Use refs to avoid stale closure issues
  const selectedUserRef = useRef<User | null>(null);
  const currentUserRef = useRef<User | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    console.log('🔔 WebSocket message received:', data);

    switch (data.type) {
      case 'message':
        // Handle incoming messages - check both senderId and sender_id for compatibility
        const incomingSenderId = data.senderId || data.sender_id;
        const incomingReceiverId = data.receiverId || data.receiver_id;
        const messageContent = data.message || data.content;
        
        console.log('📨 Incoming message - senderId:', incomingSenderId, 'receiverId:', incomingReceiverId);
        console.log('👤 Current user:', currentUserRef.current?.id);
        console.log('👥 Selected user:', selectedUserRef.current?.id);
        console.log('💬 Message content:', messageContent);
        
        // Only process if we are the receiver
        if (incomingReceiverId === currentUserRef.current?.id && incomingSenderId !== currentUserRef.current?.id) {
          console.log('✅ Message is for us from user:', incomingSenderId);
          
          // Check if the sender is blocked
          const senderIsBlocked = selectedUserRef.current?.id === incomingSenderId && selectedUserRef.current?.isBlocked;
          
          if (senderIsBlocked) {
            console.log('🚫 Message from blocked user, ignoring');
            return;
          }
          
          const newMessage: Message = {
            id: data.id || Date.now(),
            sender_id: incomingSenderId!,
            receiver_id: incomingReceiverId!,
            message: messageContent!,
            timestamp: data.timestamp || new Date().toISOString(),
            senderUsername: data.senderUsername,
          };
          
          // Check if this message is for the currently selected conversation
          const isCurrentConversation = selectedUserRef.current?.id === incomingSenderId;
          
          if (isCurrentConversation) {
            console.log('💬 Adding message to visible conversation');
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } else {
            console.log('📭 Message from different conversation, not adding to current view');
            // TODO: Could add unread message indicator here
          }
        }
        break;

      case 'message_confirmed':
        const confirmedContent = data.message || data.content;
        if (data.tempId && data.sender_id === currentUserRef.current?.id) {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.tempId === data.tempId) {
                const confirmedMessage: Message = {
                  id: data.id || Date.now(),
                  sender_id: data.sender_id!,
                  receiver_id: data.receiver_id!,
                  message: confirmedContent!,
                  timestamp: data.timestamp || new Date().toISOString(),
                  senderUsername: data.senderUsername,
                };
                return confirmedMessage;
              }
              return msg;
            })
          );
        }
        break;

      case 'typing':
        const typingSenderId = data.senderId || data.sender_id;
        if (selectedUserRef.current && typingSenderId === selectedUserRef.current.id) {
          setIsTyping(data.isTyping || false);
        }
        break;

      case 'game_invitation':
        setNotification({
          id: `invite-${data.inviteId}`,
          title: 'Game Invitation',
          message: `${data.senderUsername} invited you to play Pong!`,
          type: 'game',
          actions: [
            {
              text: 'Accept',
              class: 'accept-btn',
              action: () => respondToInvite(data.inviteId!, 'accepted'),
            },
            {
              text: 'Decline',
              class: 'decline-btn',
              action: () => respondToInvite(data.inviteId!, 'declined'),
            },
          ],
        });
        break;

      case 'game_invitation_response':
        setNotification({
          id: `response-${Date.now()}`,
          title: 'Game Response',
          message: `Your game invitation was ${data.status}`,
          type: data.status === 'accepted' ? 'success' : 'warning',
          actions: [],
        });
        setTimeout(() => setNotification(null), 3000);
        break;

      case 'tournament_match':
        setNotification({
          id: `tournament-${Date.now()}`,
          title: 'Tournament Match',
          message: `Your next match in ${data.tournamentName} (Round ${data.round}) is ready!`,
          type: 'game',
          actions: [
            {
              text: 'OK',
              class: 'accept-btn',
              action: () => setNotification(null),
            },
          ],
        });
        break;

      case 'error':
        console.error('WebSocket error:', data.message);
        break;
    }
  }, [currentUser, selectedUser]);

  const { sendMessage: sendWsMessage, connectionStatus } = useWebSocket({
    userId: currentUser?.id || null,
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?userId=${currentUser?.id}`);
      const allUsers = await response.json();
      setUsers(allUsers.filter((u: User) => u.id !== currentUser?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      const response = await fetch(
        `${API_URL}/messages/${currentUser.id}/${selectedUser.id}`
      );
      const msgs = await response.json();
      
      // Map backend fields to frontend Message type
      const mappedMessages = msgs.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: msg.content, // Backend uses 'content', frontend uses 'message'
        timestamp: msg.created_at,
        senderUsername: msg.sender_username
      }));
      
      console.log('📥 Loaded messages:', mappedMessages.length);
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!selectedUser || !currentUser) return;

    // Prevent sending messages if user is blocked
    if (selectedUser.isBlocked) {
      console.log('Cannot send message to blocked user');
      return;
    }

    const tempId = `temp-${tempMessageCounter}`;
    setTempMessageCounter((prev) => prev + 1);

    const tempMessage: Message = {
      id: 0,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message,
      timestamp: new Date().toISOString(),
      tempId,
    };

    setMessages((prev) => [...prev, tempMessage]);

    sendWsMessage({
      type: 'message',
      receiverId: selectedUser.id,
      content: message,
      tempId,
    });
  };

  const handleTyping = (typing: boolean) => {
    if (!selectedUser) return;
    sendWsMessage({
      type: 'typing',
      receiverId: selectedUser.id,
      isTyping: typing,
    });
  };

  const handleViewProfile = async () => {
    if (!selectedUser) return;
    setProfileModalOpen(true);
  };

  const handleInviteToGame = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      await fetch(`${API_URL}/game/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedUser.id,
        }),
      });
    } catch (error) {
      console.error('Failed to send game invitation:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      const isBlocked = selectedUser.isBlocked;
      const endpoint = isBlocked ? 'unblock' : 'block';
      
      await fetch(`${API_URL}/users/${currentUser.id}/${endpoint}/${selectedUser.id}`, {
        method: 'POST',
      });
      
      // Update selected user
      const updatedSelectedUser = { ...selectedUser, isBlocked: !isBlocked };
      setSelectedUser(updatedSelectedUser);
      
      // Update users list
      setUsers(users.map(u => 
        u.id === selectedUser.id ? updatedSelectedUser : u
      ));
    } catch (error) {
      console.error('Failed to block/unblock user:', error);
    }
  };

  const respondToInvite = async (inviteId: number, status: string) => {
    try {
      await fetch(`${API_URL}/game/invite/${inviteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setNotification(null);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-valo-dark-bg dark:bg-valo-dark-bg">
      <ChatSidebar
        users={users}
        selectedUser={selectedUser}
        currentUsername={currentUser.username}
        connectionStatus={connectionStatus}
        onSelectUser={setSelectedUser}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          selectedUser={selectedUser}
          onViewProfile={handleViewProfile}
          onInviteToGame={handleInviteToGame}
          onBlockUser={handleBlockUser}
          isBlocked={selectedUser?.isBlocked || false}
        />

        <MessageList messages={messages} currentUserId={currentUser.id} />

        {isTyping && selectedUser && (
          <div className="px-4 py-2 text-sm text-valo-blue animate-pulse">
            {selectedUser.username} is typing...
          </div>
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={!selectedUser || selectedUser.isBlocked}
          isBlocked={selectedUser?.isBlocked}
        />
      </div>

      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Agent Profile"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-valo-red/20 border-2 border-valo-red rounded-lg mx-auto mb-4 flex items-center justify-center relative">
                <Icons.User className="w-12 h-12 text-valo-red" />
                {selectedUser.status === 'online' && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-valo-green border-4 border-valo-dark-bg-secondary rounded-full" />
                )}
              </div>
              <h3 className="text-2xl font-bold uppercase text-white">
                {selectedUser.username}
              </h3>
              <p className="text-sm text-gray-400 uppercase mt-1 flex items-center justify-center gap-2">
                <Icons.Online className={`w-3 h-3 ${selectedUser.status === 'online' ? 'text-valo-green' : 'text-gray-500'}`} />
                {selectedUser.status || 'offline'}
              </p>
            </div>
            <div className="border-t-2 border-valo-dark-border pt-4 space-y-2">
              <div className="flex items-center justify-between p-3 bg-valo-dark-bg-tertiary border border-valo-dark-border rounded">
                <span className="text-sm text-gray-400">Agent ID</span>
                <span className="text-sm font-bold text-valo-gold">#{selectedUser.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-valo-dark-bg-tertiary border border-valo-dark-border rounded">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-bold ${selectedUser.isBlocked ? 'text-red-500' : 'text-valo-green'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {notification && (
        <Notification
          isVisible={true}
          title={notification.title}
          message={notification.message}
          actions={notification.actions}
          type={notification.type}
        />
      )}
    </div>
  );
};