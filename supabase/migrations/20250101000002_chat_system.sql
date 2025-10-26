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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Public rooms are viewable by everyone" ON chat_rooms
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create public rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND is_public = true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in public rooms" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.is_public = true
    )
  );

CREATE POLICY "Authenticated users can send messages to public rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.is_public = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chat_rooms
CREATE TRIGGER update_chat_rooms_updated_at 
  BEFORE UPDATE ON chat_rooms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default general room
INSERT INTO chat_rooms (name, description, is_public) 
VALUES ('General', 'General discussion room for all users', true)
ON CONFLICT DO NOTHING;
