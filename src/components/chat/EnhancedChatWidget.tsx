import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  MessageCircle, 
  X, 
  Send,
  Minimize2,
  Reply,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { containsProfanity, checkSpam } from '@/utils/profanityFilter';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  reply_to?: string;
  reply_to_username?: string;
  reactions?: Record<string, number>;
}

export const EnhancedChatWidget: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
  const [reactionPickerOpen, setReactionPickerOpen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Comprehensive emoji list
  const emojis = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
    '😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
    '🤐','🤨','😐','😑','😶','😶‍🌫️','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤',
    '😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯','🤠','🥳','😎',
    '🤓','🧐','😕','😟','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡',
    '🤬','🤯','😳','🥶','😰','😥','😓','🫣','🤗','🫡','🤤','😱','😨','😰','😯','😦',
    '😧','😮','😲','🥱','😴','🤤','😪','😵','😵‍💫','🤐','🥴','🤢','🤮','🤧','😷','🤒',
    '🤕','🤑','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺',
    '😸','😹','😻','😼','😽','🙀','😿','😾','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏',
    '✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛',
    '🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂',
    '🦻','👃','👶','👧','🧒','👦','👩','🧑','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👱‍♀️','👱','👱‍♂️',
    '👩‍🦳','👨‍🦳','👩‍🦲','👨‍🦲','🧔','👵','🧓','👴','👲','👳‍♀️','👳','👳‍♂️','🧕','👮‍♀️','👮','👮‍♂️',
    '👷‍♀️','👷','👷‍♂️','💂‍♀️','💂','💂‍♂️','🕵️‍♀️','🕵️','🕵️‍♂️','👩‍⚕️','👨‍⚕️','👩‍🌾','👨‍🌾','👩‍🍳','👨‍🍳',
    '👩‍🎓','👨‍🎓','👩‍🎤','👨‍🎤','👩‍🏫','👨‍🏫','👩‍🏭','👨‍🏭','👩‍💻','👨‍💻','👩‍💼','👨‍💼','👩‍🔧','👨‍🔧','👩‍🔬','👨‍🔬',
    '👩‍🎨','👨‍🎨','👩‍🚒','👨‍🚒','👩‍✈️','👨‍✈️','👩‍🚀','👨‍🚀','👩‍⚖️','👨‍⚖️','👰','👰‍♂️','🤵','🤵‍♂️','👸','🤴',
    '🦸‍♀️','🦸','🦸‍♂️','🦹‍♀️','🦹','🦹‍♂️','🤶','🎅','🧙‍♀️','🧙','🧙‍♂️','🧝‍♀️','🧝','🧝‍♂️','🧛‍♀️','🧛',
    '🧛‍♂️','🧟‍♀️','🧟','🧟‍♂️','🧞‍♀️','🧞','🧞‍♂️','🧜‍♀️','🧜','🧜‍♂️','🧚‍♀️','🧚','🧚‍♂️','👼','🤰','🤱',
    '🙇‍♀️','🙇','🙇‍♂️','💁‍♀️','💁','💁‍♂️','🙅‍♀️','🙅','🙅‍♂️','🙆‍♀️','🙆','🙆‍♂️','🙋‍♀️','🙋','🙋‍♂️',
    '🧏‍♀️','🧏','🧏‍♂️','🤦‍♀️','🤦','🤦‍♂️','🤷‍♀️','🤷','🤷‍♂️','🙎‍♀️','🙎','🙎‍♂️','🙍‍♀️','🙍','🙍‍♂️',
    '💇‍♀️','💇','💇‍♂️','💆‍♀️','💆','💆‍♂️','🧖‍♀️','🧖','🧖‍♂️','💃','🕺','🕴️','👯‍♀️','👯','👯‍♂️',
    '🧘‍♀️','🧘','🧘‍♂️','🛀','🛌','👭','👫','👬','💏','💑','👪','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧',
    '👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦','👨‍👨‍👧‍👧','👩‍👦','👩‍👧',
    '👩‍👧‍👦','👩‍👦‍👦','👩‍👧‍👧','👨‍👦','👨‍👧','👨‍👧‍👦','👨‍👦‍👦','👨‍👧‍👧','👚','👕','👖','🩲','🩳','👔','👗',
    '👙','👘','🥻','🩱','👟','👠','🥾','🥿','👞','🧦','🧤','🧣','🥽','🥼','🦺','👓',
    '🕶️','🦱','🦰','🦳','🦲','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯',
    '🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥',
    '🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰',
    '🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞',
    '🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘',
    '🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐',
    '🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️',
    '🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄',
    '🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🪺','🪶',
    '🍄','🐚','🪨','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜',
    '🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐',
    '🌟','✨','⚡','☄️','💥','🔥','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️',
    '⛄','😀','😂','😊','😍','🤔','😴','😭','😡','😱','🤗','👋','✋','👍','👎','👏',
    '🤝','🙏','✍️','💅','🤳','💪','👄','👅','👂','👃','👀','👁️','🧠','🫀','🫁','🦷',
    '🦴','👀','👁️','👁️‍🗨️','🧑','👔'
  ];

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
      // Mark as read when scrolled to bottom
      if (messages.length > 0) {
        setUnreadCount(0);
        setLastReadTime(new Date());
      }
    }
  }, [messages, isOpen, isMinimized]);

  // Track unread messages
  useEffect(() => {
    if (!isOpen || isMinimized) {
      // Count messages that arrived after the last read time
      const unread = messages.filter(msg => {
        if (!lastReadTime) return true;
        return new Date(msg.created_at) > lastReadTime;
      }).length;
      setUnreadCount(unread);
    }
  }, [messages, isOpen, isMinimized, lastReadTime]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', '7bd8428d-e464-4f5d-9bb7-73f1efb6a051')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user details and build message objects
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', msg.user_id)
            .single();

          let replyData = null;
          if (msg.reply_to) {
            const { data: replyUser } = await supabase
              .from('users')
              .select('username')
              .eq('id', msg.reply_to)
              .single();
            replyData = replyUser?.username || null;
          }

          return {
            id: msg.id,
            content: msg.content,
            user_id: msg.user_id,
            username: userData?.username || 'Anonymous',
            avatar_url: userData?.avatar_url,
            created_at: msg.created_at,
            reply_to: msg.reply_to || undefined,
            reply_to_username: replyData,
            reactions: msg.reactions || {}
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
      .channel('enhanced-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'room_id=eq.7bd8428d-e464-4f5d-9bb7-73f1efb6a051'
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          let replyData = null;
          if (payload.new.reply_to) {
            const { data: replyUser } = await supabase
              .from('users')
              .select('username')
              .eq('id', payload.new.reply_to)
              .single();
            replyData = replyUser?.username || null;
          }

          const newMessage = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            username: userData?.username || 'Anonymous',
            avatar_url: userData?.avatar_url,
            created_at: payload.new.created_at,
            reply_to: payload.new.reply_to || undefined,
            reply_to_username: replyData,
            reactions: payload.new.reactions || {}
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: 'room_id=eq.7bd8428d-e464-4f5d-9bb7-73f1efb6a051'
        },
        (payload) => {
          // Update message with new reactions
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id 
              ? { ...msg, reactions: payload.new.reactions || {} }
              : msg
          ));
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

    // STRICT LOGIN REQUIREMENT
    if (!user) {
      toast.info('Please sign in to send messages');
      const currentPath = window.location.pathname;
      localStorage.setItem('returnAfterSignIn', currentPath);
      navigate('/auth');
      return;
    }

    // Check for profanity
    if (containsProfanity(messageInput)) {
      toast.error('Your message contains inappropriate language. Please try again.');
      return;
    }

    // Check for spam
    const spamCheck = checkSpam(user.id);
    if (!spamCheck.allowed) {
      toast.error(spamCheck.reason);
      return;
    }

    try {
      const messageData: any = {
        content: messageInput,
        user_id: user.id,
        room_id: '7bd8428d-e464-4f5d-9bb7-73f1efb6a051'
      };

      if (replyingTo) {
        messageData.reply_to = replyingTo.user_id;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error('Database error:', error);
        toast.error(`Failed to send message: ${error.message}`);
      } else {
        // Optimistically add the message to the UI immediately
        const { data: userData } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        const optimisticMessage = {
          id: data[0].id,
          content: messageInput,
          user_id: user.id,
          username: userData?.username || 'Anonymous',
          avatar_url: userData?.avatar_url,
          created_at: new Date().toISOString(),
          reply_to: replyingTo?.user_id,
          reply_to_username: replyingTo?.username,
          reactions: {}
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setMessageInput('');
        setReplyingTo(null);
        toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    if (!user) {
      toast.info('Please sign in to react to messages');
      return;
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const newReactions = { ...(message.reactions || {}) };
    const currentCount = newReactions[reaction] || 0;
    
    // Toggle reaction
    if (currentCount > 0) {
      delete newReactions[reaction];
    } else {
      newReactions[reaction] = 1;
    }

    // Optimistically update the UI
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: newReactions }
        : msg
    ));

    const { error } = await supabase
      .from('chat_messages')
      .update({ reactions: newReactions })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
      // Revert on error
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: message.reactions || {} }
          : msg
      ));
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };



  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-[9999] h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground hover-glow"
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
        "fixed bottom-4 right-4 z-[9999] flex flex-col",
        "bg-card border border-border rounded-2xl shadow-2xl",
        isMinimized ? "h-14 w-80" : "h-[600px] w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Live Chat</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-3 bg-background">
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No messages yet. Be the first to comment!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="flex space-x-2 hover:bg-muted/50 p-2 rounded transition-colors">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.avatar_url} />
                        <AvatarFallback className="text-xs bg-muted text-foreground">
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        {message.reply_to_username && (
                          <div className="text-xs text-primary mb-1">
                            Replying to {message.reply_to_username}
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-foreground">
                            {message.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground break-words">
                          {message.content}
                        </p>
                        
                        {/* Reactions and actions - always visible reactions, hover actions */}
                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                          {/* Reactions - always visible */}
                          {Object.entries(message.reactions || {}).map(([emoji, count]) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              {emoji} {count}
                            </Button>
                          ))}
                          
                          {/* Action buttons - only visible on hover */}
                          <Popover open={reactionPickerOpen === message.id} onOpenChange={(open) => setReactionPickerOpen(open ? message.id : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Smile className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 h-64 overflow-y-auto p-2 z-[10000]" side="top" align="start">
                              <ScrollArea className="h-[240px]">
                                <div className="grid grid-cols-8 gap-1">
                                  {emojis.map((emoji) => (
                                    <Button
                                      key={emoji}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-lg hover:bg-accent"
                                      onClick={() => {
                                        handleReaction(message.id, emoji);
                                        setReactionPickerOpen(null);
                                      }}
                                    >
                                      {emoji}
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-border bg-muted/50">
            {replyingTo && (
              <div className="mb-2 p-2 bg-primary/10 border border-primary/20 rounded flex items-center justify-between">
                <span className="text-xs text-primary">
                  Replying to {replyingTo.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {user ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <input
                  type="text"
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Say something..."}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim() || authLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            ) : (
              <div className="space-y-2">
                <input
                  placeholder="Sign in to chat..."
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  onClick={() => {
                    const currentPath = window.location.pathname;
                    localStorage.setItem('returnAfterSignIn', currentPath);
                    navigate('/auth');
                  }}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={authLoading}
                >
                  Sign In to Send
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
