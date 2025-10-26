-- Add master user broadcast control columns
ALTER TABLE broadcast_state
ADD COLUMN is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN paused_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN paused_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX idx_broadcast_state_paused ON broadcast_state(is_paused);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Anyone can read broadcast state" ON broadcast_state;
DROP POLICY IF EXISTS "Authenticated users can update viewer count" ON broadcast_state;

-- Create new RLS policies

-- Everyone can read broadcast_state
CREATE POLICY "Anyone can read broadcast state" ON broadcast_state
  FOR SELECT USING (true);

-- Only master user (aalang@ucsc.edu) can pause/unpause the broadcast
CREATE POLICY "Master user can pause/unpause" ON broadcast_state
  FOR UPDATE
  USING (auth.email() = 'aalang@ucsc.edu')
  WITH CHECK (auth.email() = 'aalang@ucsc.edu');

-- Authenticated users can still update viewer count (but not pause state)
-- This is handled at the application level to avoid conflicts

-- Add comment explaining master user control
COMMENT ON COLUMN broadcast_state.is_paused IS 'Whether the broadcast is paused by master user (aalang@ucsc.edu)';
COMMENT ON COLUMN broadcast_state.paused_by_user_id IS 'User ID of who paused the broadcast';
COMMENT ON COLUMN broadcast_state.paused_at IS 'Timestamp when broadcast was paused';
