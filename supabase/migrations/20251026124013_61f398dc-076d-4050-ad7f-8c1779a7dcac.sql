-- Add pause-related columns to broadcast_state table
ALTER TABLE broadcast_state 
ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS paused_at timestamptz;