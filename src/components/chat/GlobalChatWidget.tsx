import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Send,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export const GlobalChatWidget: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

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
      .channel('global-chat')
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
    if (!messageInput.trim()) return;

    // Check if user is authenticated - STRICT CHECK
    if (!user) {
      toast.info('Please sign in to send messages');
      const currentPath = window.location.pathname;
      localStorage.setItem('returnAfterSignIn', currentPath);
      navigate('/auth');
      return;
    }

    if (authLoading) {
      toast.info('Please wait while we verify your account...');
      return;
    }

    try {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();

      const { data, error} = await supabase
        .from('chat_messages')
        .insert({
          content: messageInput.trim(),
          user_id: user.id,
          room_id: '7bd8428d-e464-4f5d-9bb7-73f1efb6a051' // General room
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to send message: ' + error.message);
      } else {
        setMessageInput('');
        toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Exception sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSignIn = () => {
    // Store current location to return after sign in
    const currentPath = window.location.pathname;
    localStorage.setItem('returnAfterSignIn', currentPath);
    navigate('/auth');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "flex items-center justify-center"
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
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl",
        "transition-all duration-300",
        isMinimized ? "h-14 w-80" : "h-[600px] w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Live Chat</span>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
          {user && (
            <Badge variant="default" className="text-xs bg-green-600">
              Signed in
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
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
                  No messages yet. Be the first to comment!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex space-x-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
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
            <form onSubmit={handleSendMessage} className="space-y-2">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={user ? "Say something..." : "Sign in to chat..."}
                disabled={authLoading}
                className="text-sm"
              />
              {user ? (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim() || authLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSignIn}
                  size="sm"
                  className="w-full"
                  disabled={authLoading}
                >
                  Sign In to Send
                </Button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};
