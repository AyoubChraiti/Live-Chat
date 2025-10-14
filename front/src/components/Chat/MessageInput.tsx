import { useState, KeyboardEvent } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  isBlocked?: boolean;
}

export const MessageInput = ({ onSendMessage, onTyping, disabled, isBlocked }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const getPlaceholder = () => {
    if (isBlocked) return 'You have blocked this agent';
    if (disabled) return 'Select an agent to chat';
    return 'Type a message...';
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Notify that user is typing
    if (value.length > 0) {
      onTyping(true);
      
      // Set timeout to stop typing indicator
      const timeout = setTimeout(() => {
        onTyping(false);
      }, 1000);
      setTypingTimeout(timeout);
    } else {
      onTyping(false);
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      onTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t-2 border-valo-dark-border bg-valo-dark-bg">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-valo-dark-bg-tertiary border-2 border-valo-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-valo-red transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          variant="primary"
          size="md"
          icon={<Icons.Send className="w-5 h-5" />}
          className="px-5"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
