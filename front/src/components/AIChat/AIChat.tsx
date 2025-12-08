import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles } from 'lucide-react';
import { aiAPI } from '../../api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await aiAPI.getSuggestions();
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiAPI.chat(content, conversationHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(response.data.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-spotify-green rounded-full shadow-lg hover:bg-spotify-green-hover transition-all hover:scale-110 z-50"
        style={{
          backgroundColor: 'var(--spotify-green)',
        }}
      >
        <Sparkles size={24} color="var(--text-on-primary)" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 w-96 h-[600px] rounded-lg shadow-2xl flex flex-col z-50"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-full"
            style={{ backgroundColor: 'var(--spotify-green)' }}
          >
            <Bot size={20} color="var(--text-on-primary)" />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Assistant
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-subdued)' }}>
              Always here to help
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-opacity-10 hover:bg-white rounded-full transition-colors"
        >
          <X size={20} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={48} color="var(--text-subdued)" className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>
              Start a conversation with AI!
            </p>
            
            {suggestions.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm" style={{ color: 'var(--text-subdued)' }}>
                  Try asking:
                </p>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full p-3 text-left rounded-lg transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
              style={{
                backgroundColor: message.role === 'user' ? 'var(--spotify-green)' : 'var(--bg-tertiary)',
                color: message.role === 'user' ? 'var(--text-on-primary)' : 'var(--text-primary)',
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p 
                className="text-xs mt-1"
                style={{ 
                  opacity: 0.7,
                  color: message.role === 'user' ? 'var(--text-on-primary)' : 'var(--text-subdued)'
                }}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="p-3 rounded-lg rounded-bl-none"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <div className="flex gap-1">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--spotify-green)', animationDelay: '0ms' }}
                />
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--spotify-green)', animationDelay: '150ms' }}
                />
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--spotify-green)', animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '12px 16px',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-full transition-all hover:scale-110 disabled:scale-100"
            style={{
              backgroundColor: input.trim() ? 'var(--spotify-green)' : 'var(--bg-highlight)',
            }}
          >
            <Send size={20} color="var(--text-on-primary)" />
          </button>
        </div>
      </form>
    </div>
  );
}
