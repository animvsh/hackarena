-- Add auto-pause columns to broadcast_state table
ALTER TABLE broadcast_state 
ADD COLUMN IF NOT EXISTS is_paused_by_system boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_pause_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_viewer_left_at timestamp with time zone;

-- Add helpful comment
COMMENT ON COLUMN broadcast_state.is_paused_by_system IS 'Indicates if broadcast was paused automatically due to no viewers';
COMMENT ON COLUMN broadcast_state.auto_pause_enabled IS 'Master setting to enable/disable auto-pause when no viewers';
COMMENT ON COLUMN broadcast_state.last_viewer_left_at IS 'Timestamp when last viewer left (for auto-pause delay)';