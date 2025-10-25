-- Hacker Stats and Analytics Schema
-- Moneyball for Hackathons - Individual hacker performance prediction

-- Hacker profiles table (extends team_members)
CREATE TABLE IF NOT EXISTS hacker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  
  -- LinkedIn Data
  linkedin_url TEXT,
  linkedin_headline TEXT,
  current_company TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'mid', 'enterprise', 'faang')),
  years_experience INTEGER DEFAULT 0,
  seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'staff', 'principal')),
  
  -- Raw LinkedIn Data (JSON)
  linkedin_data JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hacker stats table (calculated scores)
CREATE TABLE IF NOT EXISTS hacker_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hacker_profile_id UUID REFERENCES hacker_profiles(id) ON DELETE CASCADE,
  
  -- Core Stats (0-100)
  hackathon_experience INTEGER DEFAULT 0,
  technical_skill INTEGER DEFAULT 0,
  leadership_score INTEGER DEFAULT 0,
  innovation_score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  
  -- Specialized Stats (0-100)
  ai_ml_expertise INTEGER DEFAULT 0,
  fintech_experience INTEGER DEFAULT 0,
  blockchain_knowledge INTEGER DEFAULT 0,
  mobile_dev_skill INTEGER DEFAULT 0,
  fullstack_proficiency INTEGER DEFAULT 0,
  
  -- Meta Stats (0-100)
  consistency_score INTEGER DEFAULT 0,
  growth_trajectory INTEGER DEFAULT 0,
  network_strength INTEGER DEFAULT 0,
  company_prestige INTEGER DEFAULT 0,
  
  -- Calculated Scores
  overall_rating INTEGER DEFAULT 0,
  market_value INTEGER DEFAULT 0, -- HackCoins equivalent
  
  -- Analysis Metadata
  analysis_version TEXT DEFAULT '1.0',
  confidence_score DECIMAL DEFAULT 0.0, -- How confident we are in this analysis
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team composition analysis
CREATE TABLE IF NOT EXISTS team_composition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Team Synergy Metrics (0-100)
  skill_diversity INTEGER DEFAULT 0,
  experience_gap INTEGER DEFAULT 0,
  leadership_clarity INTEGER DEFAULT 0,
  domain_expertise INTEGER DEFAULT 0,
  
  -- Predictive Metrics (0-100)
  hackathon_readiness INTEGER DEFAULT 0,
  innovation_potential INTEGER DEFAULT 0,
  execution_ability INTEGER DEFAULT 0,
  market_fit_understanding INTEGER DEFAULT 0,
  
  -- Calculated Team Score
  overall_team_rating INTEGER DEFAULT 0,
  predicted_performance INTEGER DEFAULT 0,
  
  -- Analysis Metadata
  analysis_version TEXT DEFAULT '1.0',
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathon performance history
CREATE TABLE IF NOT EXISTS hackathon_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hacker_profile_id UUID REFERENCES hacker_profiles(id) ON DELETE CASCADE,
  
  hackathon_name TEXT NOT NULL,
  hackathon_date DATE,
  team_name TEXT,
  placement INTEGER, -- 1st, 2nd, 3rd, etc.
  category TEXT, -- "AI", "FinTech", etc.
  prize_amount INTEGER DEFAULT 0,
  
  -- Performance metrics
  project_complexity INTEGER DEFAULT 0, -- 0-100
  innovation_score INTEGER DEFAULT 0,   -- 0-100
  execution_quality INTEGER DEFAULT 0,  -- 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LinkedIn data extraction log
CREATE TABLE IF NOT EXISTS linkedin_extraction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hacker_profile_id UUID REFERENCES hacker_profiles(id) ON DELETE CASCADE,
  
  extraction_status TEXT CHECK (extraction_status IN ('pending', 'in_progress', 'completed', 'failed')),
  extraction_method TEXT, -- 'api', 'scraping', 'manual'
  data_points_extracted INTEGER DEFAULT 0,
  error_message TEXT,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hacker_profiles_team_member ON hacker_profiles(team_member_id);
CREATE INDEX IF NOT EXISTS idx_hacker_stats_profile ON hacker_stats(hacker_profile_id);
CREATE INDEX IF NOT EXISTS idx_hacker_stats_overall_rating ON hacker_stats(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_team_composition_team ON team_composition(team_id);
CREATE INDEX IF NOT EXISTS idx_team_composition_rating ON team_composition(overall_team_rating DESC);
CREATE INDEX IF NOT EXISTS idx_hackathon_performance_profile ON hackathon_performance(hacker_profile_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_performance_date ON hackathon_performance(hackathon_date DESC);

-- Enable RLS
ALTER TABLE hacker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hacker_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_extraction_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read access" ON hacker_profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hacker_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON team_composition FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hackathon_performance FOR SELECT USING (true);
CREATE POLICY "Public read access" ON linkedin_extraction_log FOR SELECT USING (true);

-- Function to calculate team composition
CREATE OR REPLACE FUNCTION calculate_team_composition(p_team_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  team_stats RECORD;
  hacker_count INTEGER;
  avg_experience DECIMAL;
  max_experience INTEGER;
  min_experience INTEGER;
  skill_diversity_score INTEGER;
  leadership_score INTEGER;
BEGIN
  -- Get team hacker stats
  SELECT 
    COUNT(*) as count,
    AVG(hs.technical_skill) as avg_tech,
    AVG(hs.hackathon_experience) as avg_hackathon,
    AVG(hs.leadership_score) as avg_leadership,
    MAX(hs.years_experience) as max_exp,
    MIN(hs.years_experience) as min_exp
  INTO team_stats
  FROM hacker_profiles hp
  JOIN hacker_stats hs ON hp.id = hs.hacker_profile_id
  JOIN team_members tm ON hp.team_member_id = tm.id
  WHERE tm.team_id = p_team_id;

  hacker_count := team_stats.count;
  
  IF hacker_count = 0 THEN
    RETURN;
  END IF;

  -- Calculate skill diversity (based on standard deviation of technical skills)
  -- Higher diversity = better team balance
  skill_diversity_score := LEAST(100, GREATEST(0, team_stats.avg_tech));
  
  -- Calculate experience gap (smaller gap = better)
  max_experience := team_stats.max_exp;
  min_experience := team_stats.min_exp;
  experience_gap := LEAST(100, GREATEST(0, 100 - ((max_experience - min_experience) * 5)));
  
  -- Calculate leadership clarity (one clear leader vs distributed)
  leadership_score := LEAST(100, GREATEST(0, team_stats.avg_leadership));

  -- Insert or update team composition
  INSERT INTO team_composition (
    team_id,
    skill_diversity,
    experience_gap,
    leadership_clarity,
    domain_expertise,
    hackathon_readiness,
    innovation_potential,
    execution_ability,
    market_fit_understanding,
    overall_team_rating,
    predicted_performance,
    last_calculated
  ) VALUES (
    p_team_id,
    skill_diversity_score,
    experience_gap,
    leadership_score,
    team_stats.avg_hackathon, -- Use hackathon experience as domain expertise proxy
    (skill_diversity_score + experience_gap + leadership_score) / 3, -- hackathon_readiness
    team_stats.avg_tech, -- innovation_potential
    team_stats.avg_tech, -- execution_ability  
    team_stats.avg_leadership, -- market_fit_understanding
    (skill_diversity_score + experience_gap + leadership_score + team_stats.avg_tech) / 4, -- overall_team_rating
    (skill_diversity_score + experience_gap + leadership_score + team_stats.avg_tech) / 4, -- predicted_performance
    NOW()
  )
  ON CONFLICT (team_id) DO UPDATE SET
    skill_diversity = EXCLUDED.skill_diversity,
    experience_gap = EXCLUDED.experience_gap,
    leadership_clarity = EXCLUDED.leadership_clarity,
    domain_expertise = EXCLUDED.domain_expertise,
    hackathon_readiness = EXCLUDED.hackathon_readiness,
    innovation_potential = EXCLUDED.innovation_potential,
    execution_ability = EXCLUDED.execution_ability,
    market_fit_understanding = EXCLUDED.market_fit_understanding,
    overall_team_rating = EXCLUDED.overall_team_rating,
    predicted_performance = EXCLUDED.predicted_performance,
    last_calculated = NOW();
END;
$$;

-- Trigger to update team composition when hacker stats change
CREATE OR REPLACE FUNCTION update_team_composition_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get team_id from the updated hacker profile
  PERFORM calculate_team_composition(
    (SELECT tm.team_id 
     FROM team_members tm 
     JOIN hacker_profiles hp ON tm.id = hp.team_member_id 
     WHERE hp.id = NEW.hacker_profile_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER hacker_stats_update_team_composition
AFTER INSERT OR UPDATE ON hacker_stats
FOR EACH ROW
EXECUTE FUNCTION update_team_composition_trigger();


