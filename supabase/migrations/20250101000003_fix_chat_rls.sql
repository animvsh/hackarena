-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can send messages to public rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in public rooms" ON chat_messages;

-- Create simpler policies that work with authenticated users
CREATE POLICY "Anyone can view messages in public rooms" 
  ON chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.is_public = true
    )
  );

-- Allow authenticated users to insert messages (simpler check)
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
