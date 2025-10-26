import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Users,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface BroadcastChatSidebarProps {
  className?: string;
}

export const BroadcastChatSidebar: React.FC<BroadcastChatSidebarProps> = ({ className }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', '7bd8428d-e464-4f5d-9bb7-73f1efb6a051') // General room
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user details for each message
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', msg.user_id)
            .single();

          return {
            id: msg.id,
            content: msg.content,
            user_id: msg.user_id,
            username: userData?.username || 'Anonymous',
            avatar_url: userData?.avatar_url,
            created_at: msg.created_at
          };
        })
      );

      setMessages(messagesWithUsers);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('broadcast-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'room_id=eq.7bd8428d-e464-4f5d-9bb7-73f1efb6a051'
        },
        async (payload) => {
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            username: userData?.username || 'Anonymous',
            avatar_url: userData?.avatar_url,
            created_at: payload.new.created_at
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || !profile) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: messageInput.trim(),
          user_id: user.id,
          room_id: '7bd8428d-e464-4f5d-9bb7-73f1efb6a051' // General room
        });

      if (error) throw error;
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full z-40 flex transition-all duration-300",
        "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700",
        isCollapsed ? "w-12" : "w-80",
        className
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-4 z-50 h-8 w-8 p-0",
          isCollapsed ? "right-2" : "left-2"
        )}
        variant="outline"
        size="sm"
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {!isCollapsed && (
        <div className="flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Live Chat</h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No messages yet. Be the first to comment!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {user && profile ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">
                  Sign in to join the conversation
                </p>
                <Button
                  onClick={() => window.location.href = '/auth'}
                  size="sm"
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};



