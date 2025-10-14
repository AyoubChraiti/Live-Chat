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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm uppercase tracking-wide">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
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
                    max-w-[70%] p-3 border-2
                    ${
                      isSent
                        ? 'bg-valo-red/20 border-valo-red text-white'
                        : 'bg-valo-blue/20 border-valo-blue text-white'
                    }
                  `}
                >
                  <div className="text-sm break-words">{message.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isSent ? 'text-valo-red-light' : 'text-valo-blue-light'
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
