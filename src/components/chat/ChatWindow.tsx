import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Send,
  Users,
  Hash,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    messages,
    currentRoom,
    isConnected,
    isMinimized,
    isOpen,
    sendMessage,
    toggleChat,
    minimizeChat,
    expandChat,
    loading
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || loading || !user || !profile) return;

    const message = messageInput.trim();
    setMessageInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Don't show chat if user is not authenticated or profile is not loaded
  if (authLoading || !user || !profile) {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "animate-pulse"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col",
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
        "rounded-lg shadow-xl transition-all duration-300",
        isMinimized ? "h-12 w-80" : "h-96 w-80",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Hash className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">
              {currentRoom?.name || 'Chat'}
            </span>
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className="h-5 text-xs"
          >
            {isConnected ? 'Online' : 'Connecting...'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={isMinimized ? expandChat : minimizeChat}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChat}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {message.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 text-sm"
                disabled={loading || !isConnected || !user || !profile}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!messageInput.trim() || loading || !isConnected || !user || !profile}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
