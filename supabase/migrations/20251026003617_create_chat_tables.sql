-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON chat_messages(reply_to);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public rooms are viewable by everyone" ON chat_rooms;
DROP POLICY IF EXISTS "Authenticated users can create public rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in public rooms" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages to public rooms" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages in public rooms" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages for reactions" ON chat_messages;

-- RLS Policies for chat_rooms
CREATE POLICY "Public rooms are viewable by everyone" ON chat_rooms
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create public rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND is_public = true);

-- RLS Policies for chat_messages
CREATE POLICY "Anyone can view messages in public rooms" 
  ON chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.is_public = true
    )
  );

-- Allow authenticated users to insert messages
CREATE POLICY "Authenticated users can send messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.is_public = true
    )
  );

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" 
  ON chat_messages FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" 
  ON chat_messages FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow authenticated users to update any message for reactions
CREATE POLICY "Authenticated users can update messages for reactions"
  ON chat_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Enable realtime for chat_messages
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Insert default general room
INSERT INTO chat_rooms (id, name, description, is_public) 
VALUES ('7bd8428d-e464-4f5d-9bb7-73f1efb6a051', 'General', 'General discussion room for all users', true)
ON CONFLICT (id) DO NOTHING;
