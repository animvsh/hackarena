-- Create broadcast_state table for global broadcast synchronization
CREATE TABLE broadcast_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL CHECK (state IN ('splash', 'live', 'commercial')),
  current_scene TEXT NOT NULL CHECK (current_scene IN ('anchor', 'market', 'highlight', 'stats', 'team')),
  current_segment_id TEXT,
  commentary_index INTEGER DEFAULT 0,
  phase TEXT CHECK (phase IN ('BUMPER_IN', 'CONTENT_DELIVERY', 'BUMPER_OUT', 'TRANSITION')),
  live_viewer_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure only one row exists (singleton pattern)
  singleton BOOLEAN DEFAULT TRUE UNIQUE CHECK (singleton = TRUE)
);

-- Insert initial state
INSERT INTO broadcast_state (state, current_scene, phase, live_viewer_count) 
VALUES ('live', 'anchor', 'CONTENT_DELIVERY', 0);

-- Enable RLS
ALTER TABLE broadcast_state ENABLE ROW LEVEL SECURITY;

-- Everyone can read the broadcast state
CREATE POLICY "Anyone can read broadcast state" ON broadcast_state
  FOR SELECT USING (true);

-- Only authenticated users can update viewer count
CREATE POLICY "Authenticated users can update viewer count" ON broadcast_state
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Enable realtime
ALTER TABLE broadcast_state REPLICA IDENTITY FULL;