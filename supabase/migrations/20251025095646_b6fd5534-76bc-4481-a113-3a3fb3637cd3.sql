-- Create odds_history table for tracking historical odds data
CREATE TABLE odds_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES prediction_markets(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  odds decimal NOT NULL,
  volume integer DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_odds_history_market_team ON odds_history(market_id, team_id, timestamp DESC);
CREATE INDEX idx_odds_history_timestamp ON odds_history(timestamp DESC);

-- Enable realtime
ALTER TABLE odds_history REPLICA IDENTITY FULL;

-- RLS policies
ALTER TABLE odds_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "odds_history_read_all" ON odds_history
  FOR SELECT USING (true);