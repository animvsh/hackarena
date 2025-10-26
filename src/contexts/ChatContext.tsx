import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  room_id?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  is_public: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  isConnected: boolean;
  isMinimized: boolean;
  isOpen: boolean;
  sendMessage: (content: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  createRoom: (name: string, description?: string, isPublic?: boolean) => Promise<void>;
  toggleChat: () => void;
  minimizeChat: () => void;
  expandChat: () => void;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize chat system
  useEffect(() => {
    if (user) {
      initializeChat();
    } else {
      // Reset chat state when user logs out
      setMessages([]);
      setRooms([]);
      setCurrentRoom(null);
      setIsConnected(false);
      setIsOpen(false);
      setIsMinimized(false);
    }
  }, [user]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Get or create default room
      const { data: defaultRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('name', 'General')
        .single();

      if (roomError && roomError.code === 'PGRST116') {
        // Create default room if it doesn't exist
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: 'General',
            description: 'General discussion room',
            is_public: true
          })
          .select()
          .single();

        if (createError) throw createError;
        setCurrentRoom(newRoom);
      } else if (roomError) {
        throw roomError;
      } else {
        setCurrentRoom(defaultRoom);
      }

      // Load rooms
      await loadRooms();
      
      // Set up real-time subscription
      await setupRealtimeSubscription();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const setupRealtimeSubscription = async () => {
    if (!currentRoom) return;

    // Load existing messages (simplified without joins for now)
    const { data: existingMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', currentRoom.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      return;
    }

    // Transform messages and fetch user details separately
    const transformedMessages = await Promise.all(
      (existingMessages || []).map(async (msg) => {
        // Fetch user details separately
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
          created_at: msg.created_at,
          room_id: msg.room_id
        };
      })
    );

    setMessages(transformedMessages);

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat:${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        async (payload) => {
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const transformedMessage = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            username: userData?.username || 'Anonymous',
            avatar_url: userData?.avatar_url,
            created_at: payload.new.created_at,
            room_id: payload.new.room_id
          };

          setMessages(prev => [...prev, transformedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string) => {
    if (!user || !currentRoom || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: content.trim(),
          user_id: user.id,
          room_id: currentRoom.id
        })
        .select();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      
      setCurrentRoom(data);
      setMessages([]);
      
      // Set up subscription for new room
      await setupRealtimeSubscription();
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const createRoom = async (name: string, description?: string, isPublic = true) => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;
      
      setRooms(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      // Opening chat - expand it
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      // Closing chat completely
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
  };

  const value: ChatContextType = {
    messages,
    rooms,
    currentRoom,
    isConnected,
    isMinimized,
    isOpen,
    sendMessage,
    joinRoom,
    createRoom,
    toggleChat,
    minimizeChat,
    expandChat,
    loading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
