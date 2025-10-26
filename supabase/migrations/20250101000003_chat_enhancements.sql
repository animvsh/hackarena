-- Add reply_to column to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add reactions column to chat_messages (stored as JSONB)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';

-- Create index for reply_to
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON chat_messages(reply_to);

-- Add policy to allow users to update their own messages for reactions
CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also allow authenticated users to update any message for reactions
-- (since reactions can be added by anyone)
CREATE POLICY "Authenticated users can update messages for reactions"
  ON chat_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);
