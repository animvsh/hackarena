-- HackCast LIVE Database Schema
-- ESPN + Bloomberg Terminal for Hackathons

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  wallet_balance INTEGER DEFAULT 1000, -- Starting HackCoins
  xp INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  category TEXT[], -- ["AI", "FinTech", "DevTools"]
  tech_stack TEXT[], -- ["React", "Claude", "Supabase"]
  github_repo TEXT,
  devpost_url TEXT,
  status TEXT DEFAULT 'active', -- active, demo, completed
  team_size INTEGER DEFAULT 4,
  current_progress INTEGER DEFAULT 0, -- 0-100
  momentum_score DECIMAL DEFAULT 50.0, -- velocity indicator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  demo_url TEXT,
  video_url TEXT,
  screenshot_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  api_documentation TEXT,
  prize_pool INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prediction Markets table
CREATE TABLE IF NOT EXISTS prediction_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- "Best AI App", "Best FinTech Hack"
  sponsor_id UUID REFERENCES sponsors(id),
  prize_amount INTEGER NOT NULL,
  total_pool INTEGER DEFAULT 0, -- Total HackCoins bet
  status TEXT DEFAULT 'open', -- open, closed, settled
  winner_team_id UUID REFERENCES teams(id),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Odds table (real-time odds for each team in each market)
CREATE TABLE IF NOT EXISTS market_odds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES prediction_markets(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  current_odds DECIMAL NOT NULL DEFAULT 50.0, -- Percentage (0-100)
  volume INTEGER DEFAULT 0, -- Total HackCoins bet on this team
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, team_id)
);

-- Predictions (user bets) table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID REFERENCES prediction_markets(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- HackCoins wagered
  odds_at_bet DECIMAL NOT NULL, -- Odds when bet was placed
  status TEXT DEFAULT 'pending', -- pending, won, lost
  payout INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Updates table (commits, screenshots, milestones)
CREATE TABLE IF NOT EXISTS progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "commit", "screenshot", "milestone", "tweet"
  title TEXT,
  content TEXT,
  metadata JSONB, -- {commit_hash, files_changed, sentiment_score, etc}
  impact_score INTEGER DEFAULT 0, -- How much this affects odds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commentary Feed table (AI-generated broadcasts)
CREATE TABLE IF NOT EXISTS commentary_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  voice_persona TEXT DEFAULT 'Analyst Ava', -- "Analyst Ava", "Coach K", "StatBot Reka"
  event_type TEXT, -- "market_shift", "milestone", "demo", "general"
  related_team_id UUID REFERENCES teams(id),
  related_market_id UUID REFERENCES prediction_markets(id),
  audio_url TEXT, -- Link to Fish Audio generated speech
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage tracking (for sponsors)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  endpoint TEXT,
  call_count INTEGER DEFAULT 1,
  last_called TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (optional - for tracking individual contributors)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  role TEXT, -- "Developer", "Designer", "PM"
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_odds_market_id ON market_odds(market_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_market_id ON predictions(market_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_team_id ON progress_updates(team_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_created_at ON progress_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commentary_feed_created_at ON commentary_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_team_sponsor ON api_usage(team_id, sponsor_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentary_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing read for all, write for authenticated)
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON prediction_markets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON market_odds FOR SELECT USING (true);
CREATE POLICY "Public read access" ON predictions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON progress_updates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON commentary_feed FOR SELECT USING (true);
CREATE POLICY "Public read access" ON api_usage FOR SELECT USING (true);
CREATE POLICY "Public read access" ON team_members FOR SELECT USING (true);

-- Function to update market odds (simplified LMSR)
CREATE OR REPLACE FUNCTION update_market_odds(
  p_market_id UUID,
  p_team_id UUID,
  p_bet_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  total_volume INTEGER;
  team_volume INTEGER;
BEGIN
  -- Get total volume for this market
  SELECT COALESCE(SUM(volume), 0) INTO total_volume
  FROM market_odds
  WHERE market_id = p_market_id;

  -- Update the specific team's volume
  UPDATE market_odds
  SET volume = volume + p_bet_amount,
      last_updated = NOW()
  WHERE market_id = p_market_id AND team_id = p_team_id;

  -- Recalculate odds for all teams in this market
  UPDATE market_odds
  SET current_odds = (volume::DECIMAL / NULLIF((SELECT SUM(volume) FROM market_odds WHERE market_id = p_market_id), 0)) * 100
  WHERE market_id = p_market_id;
END;
$$;

-- Trigger to update team momentum based on progress updates
CREATE OR REPLACE FUNCTION update_team_momentum()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teams
  SET momentum_score = LEAST(100, momentum_score + (NEW.impact_score * 0.5)),
      updated_at = NOW()
  WHERE id = NEW.team_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER progress_updates_momentum_trigger
AFTER INSERT ON progress_updates
FOR EACH ROW
EXECUTE FUNCTION update_team_momentum();
