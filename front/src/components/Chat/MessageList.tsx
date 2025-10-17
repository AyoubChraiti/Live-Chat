import { Message } from '../../types';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-valo-dark-bg">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1 text-gray-600">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isSent = message.sender_id === currentUserId;
            return (
              <div
                key={message.id || message.tempId}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`
                    max-w-[70%] px-4 py-2 border-2 rounded-2xl
                    ${
                      isSent
                        ? 'bg-valo-red/30 border-valo-red text-white shadow-[0_0_20px_rgba(255,70,85,0.5)] rounded-br-sm'
                        : 'bg-valo-blue/30 border-valo-blue text-white shadow-[0_0_20px_rgba(83,141,213,0.6)] rounded-bl-sm'
                    }
                  `}
                >
                  <div className="text-sm break-words">{message.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isSent ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
