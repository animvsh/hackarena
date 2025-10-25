-- Seed Data for HackCast LIVE

-- Insert sample users
INSERT INTO users (username, email, avatar_url, wallet_balance, xp) VALUES
('alice_codes', 'alice@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 1500, 250),
('bob_builder', 'bob@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 2000, 180),
('charlie_dev', 'charlie@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 1200, 320),
('diana_hacks', 'diana@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', 1800, 290);

-- Insert sponsors
INSERT INTO sponsors (name, logo_url, website, description, prize_pool) VALUES
('Anthropic', 'https://www.anthropic.com/images/icons/safari-pinned-tab.svg', 'https://anthropic.com', 'Build with Claude AI', 10000),
('Visa', 'https://usa.visa.com/dam/VCOM/regional/ve/romania/blogs/hero-image/visa-logo-800x450.jpg', 'https://developer.visa.com', 'FinTech Innovation', 15000),
('Chroma', 'https://www.trychroma.com/chroma.png', 'https://www.trychroma.com/', 'Vector Database for AI', 5000),
('LiveKit', 'https://livekit.io/images/livekit-mark-black.svg', 'https://livekit.io', 'Real-time Communication', 8000),
('Supabase', 'https://supabase.com/images/og/supabase-og.png', 'https://supabase.com', 'Open Source Firebase Alternative', 7000);

-- Get sponsor IDs for reference
DO $$
DECLARE
  anthropic_id UUID;
  visa_id UUID;
  chroma_id UUID;
  livekit_id UUID;
  supabase_id UUID;
BEGIN
  SELECT id INTO anthropic_id FROM sponsors WHERE name = 'Anthropic';
  SELECT id INTO visa_id FROM sponsors WHERE name = 'Visa';
  SELECT id INTO chroma_id FROM sponsors WHERE name = 'Chroma';
  SELECT id INTO livekit_id FROM sponsors WHERE name = 'LiveKit';
  SELECT id INTO supabase_id FROM sponsors WHERE name = 'Supabase';

  -- Insert teams
  INSERT INTO teams (name, tagline, logo_url, category, tech_stack, github_repo, status, current_progress, momentum_score) VALUES
  ('NeuralForge', 'Building the future of AI-powered design', 'https://api.dicebear.com/7.x/shapes/svg?seed=NeuralForge', ARRAY['AI', 'Design'], ARRAY['React', 'Claude', 'Tailwind'], 'https://github.com/hackteam/neuralforge', 'active', 72, 68.5),
  ('BytePay', 'Instant cross-border payments', 'https://api.dicebear.com/7.x/shapes/svg?seed=BytePay', ARRAY['FinTech', 'Blockchain'], ARRAY['Next.js', 'Visa API', 'Ethereum'], 'https://github.com/hackteam/bytepay', 'active', 65, 73.2),
  ('ChainForge', 'Decentralized supply chain tracking', 'https://api.dicebear.com/7.x/shapes/svg?seed=ChainForge', ARRAY['Blockchain', 'Enterprise'], ARRAY['Svelte', 'Sui', 'Chroma'], 'https://github.com/hackteam/chainforge', 'active', 58, 62.1),
  ('VisionAI', 'Real-time accessibility assistant', 'https://api.dicebear.com/7.x/shapes/svg?seed=VisionAI', ARRAY['AI', 'Accessibility'], ARRAY['Flutter', 'Claude', 'Reka'], 'https://github.com/hackteam/visionai', 'active', 81, 78.9),
  ('StreamSync', 'Live collaboration for remote teams', 'https://api.dicebear.com/7.x/shapes/svg?seed=StreamSync', ARRAY['DevTools', 'RealTime'], ARRAY['React', 'LiveKit', 'Supabase'], 'https://github.com/hackteam/streamsync', 'active', 69, 71.3),
  ('DataVault', 'Privacy-first data analytics', 'https://api.dicebear.com/7.x/shapes/svg?seed=DataVault', ARRAY['Data', 'Privacy'], ARRAY['Python', 'Chroma', 'Bright Data'], 'https://github.com/hackteam/datavault', 'active', 54, 59.7),
  ('CodeMentor AI', 'AI pair programmer for beginners', 'https://api.dicebear.com/7.x/shapes/svg?seed=CodeMentorAI', ARRAY['AI', 'Education'], ARRAY['Vue', 'Claude', 'Baseten'], 'https://github.com/hackteam/codementor', 'active', 76, 74.8),
  ('FinFlow', 'Personal finance automation', 'https://api.dicebear.com/7.x/shapes/svg?seed=FinFlow', ARRAY['FinTech', 'Consumer'], ARRAY['React Native', 'Visa', 'Lava'], 'https://github.com/hackteam/finflow', 'active', 63, 66.4);

  -- Insert prediction markets
  INSERT INTO prediction_markets (category, sponsor_id, prize_amount, total_pool, status) VALUES
  ('Best AI Application', anthropic_id, 10000, 0, 'open'),
  ('Best FinTech Innovation', visa_id, 15000, 0, 'open'),
  ('Best Use of Vector DB', chroma_id, 5000, 0, 'open'),
  ('Best Real-time App', livekit_id, 8000, 0, 'open'),
  ('Best Overall Hack', NULL, 25000, 0, 'open');

END $$;

-- Insert market odds for each team in relevant markets
DO $$
DECLARE
  team_rec RECORD;
  market_rec RECORD;
  initial_odds DECIMAL;
BEGIN
  -- For each market, assign odds to relevant teams
  FOR market_rec IN SELECT * FROM prediction_markets LOOP
    FOR team_rec IN SELECT * FROM teams LOOP
      -- Assign random but realistic initial odds
      initial_odds := 30 + (RANDOM() * 40);

      INSERT INTO market_odds (market_id, team_id, current_odds, volume)
      VALUES (market_rec.id, team_rec.id, initial_odds, FLOOR(RANDOM() * 500));
    END LOOP;
  END LOOP;

  -- Normalize odds to sum to ~100 for each market
  UPDATE market_odds mo
  SET current_odds = (mo.current_odds / market_total.total) * 100
  FROM (
    SELECT market_id, SUM(current_odds) as total
    FROM market_odds
    GROUP BY market_id
  ) market_total
  WHERE mo.market_id = market_total.market_id;
END $$;

-- Insert sample progress updates
DO $$
DECLARE
  team_rec RECORD;
  update_types TEXT[] := ARRAY['commit', 'screenshot', 'milestone', 'tweet'];
  update_type TEXT;
  i INTEGER;
BEGIN
  FOR team_rec IN SELECT * FROM teams LOOP
    -- Generate 5-10 random updates per team
    FOR i IN 1..(5 + FLOOR(RANDOM() * 5)) LOOP
      update_type := update_types[1 + FLOOR(RANDOM() * 4)];

      INSERT INTO progress_updates (team_id, type, title, content, impact_score, created_at)
      VALUES (
        team_rec.id,
        update_type,
        CASE update_type
          WHEN 'commit' THEN 'Pushed ' || (1 + FLOOR(RANDOM() * 20))::TEXT || ' commits to main'
          WHEN 'screenshot' THEN 'Updated UI design'
          WHEN 'milestone' THEN 'Completed ' || (ARRAY['backend', 'frontend', 'demo', 'integration'])[1 + FLOOR(RANDOM() * 4)]
          WHEN 'tweet' THEN 'Shared progress on Twitter'
        END,
        'Sample progress content for team ' || team_rec.name,
        FLOOR(RANDOM() * 10) + 1,
        NOW() - (RANDOM() * INTERVAL '6 hours')
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert AI commentary feed
INSERT INTO commentary_feed (text, voice_persona, event_type, created_at) VALUES
('Welcome to HackCast LIVE! We have 8 incredible teams competing across 5 categories. Let''s dive into the action!', 'Analyst Ava', 'general', NOW() - INTERVAL '2 hours'),
('Breaking: Team NeuralForge just pushed their 15th commit in the last hour! Their AI design tool is taking shape fast.', 'Coach K', 'milestone', NOW() - INTERVAL '90 minutes'),
('Market alert: BytePay''s odds just jumped from 42% to 63% in the FinTech track after their live demo!', 'StatBot Reka', 'market_shift', NOW() - INTERVAL '75 minutes'),
('VisionAI is absolutely crushing it - 81% progress and climbing! Their accessibility features are next-level.', 'Analyst Ava', 'general', NOW() - INTERVAL '60 minutes'),
('Visa API calls spiking! Teams BytePay and FinFlow are both integrating payments as we speak.', 'Coach K', 'general', NOW() - INTERVAL '45 minutes'),
('StreamSync just deployed their real-time collab feature using LiveKit. This is what we like to see!', 'StatBot Reka', 'milestone', NOW() - INTERVAL '30 minutes'),
('DataVault hitting privacy compliance checkpoints. Chroma DB integration looking solid!', 'Analyst Ava', 'general', NOW() - INTERVAL '20 minutes'),
('Hour 18 chaos! CodeMentor AI shipped a working Claude integration in under 20 minutes. That''s clutch!', 'Coach K', 'milestone', NOW() - INTERVAL '10 minutes'),
('Prediction markets heating up - we''ve seen 1,247 bets placed across all categories. The crowd is calling VisionAI for Best AI!', 'StatBot Reka', 'market_shift', NOW() - INTERVAL '5 minutes'),
('All teams entering final stretch. This is where legends are made. Stay tuned!', 'Analyst Ava', 'general', NOW() - INTERVAL '1 minute');

-- Insert sample predictions (user bets)
DO $$
DECLARE
  user_rec RECORD;
  market_rec RECORD;
  team_rec RECORD;
  bet_amount INTEGER;
BEGIN
  FOR user_rec IN SELECT * FROM users LIMIT 4 LOOP
    FOR market_rec IN SELECT * FROM prediction_markets LIMIT 3 LOOP
      -- Each user makes 2-3 bets per market
      FOR i IN 1..2 LOOP
        -- Pick a random team
        SELECT * INTO team_rec FROM teams ORDER BY RANDOM() LIMIT 1;

        -- Random bet amount
        bet_amount := 50 + FLOOR(RANDOM() * 200);

        INSERT INTO predictions (user_id, market_id, team_id, amount, odds_at_bet)
        VALUES (
          user_rec.id,
          market_rec.id,
          team_rec.id,
          bet_amount,
          (SELECT current_odds FROM market_odds WHERE market_id = market_rec.id AND team_id = team_rec.id LIMIT 1)
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert sample API usage
DO $$
DECLARE
  team_rec RECORD;
  sponsor_rec RECORD;
BEGIN
  FOR team_rec IN SELECT * FROM teams LOOP
    -- Each team uses 1-3 sponsor APIs
    FOR sponsor_rec IN SELECT * FROM sponsors ORDER BY RANDOM() LIMIT (1 + FLOOR(RANDOM() * 2)) LOOP
      INSERT INTO api_usage (team_id, sponsor_id, endpoint, call_count)
      VALUES (
        team_rec.id,
        sponsor_rec.id,
        '/api/v1/' || (ARRAY['generate', 'search', 'analyze', 'process'])[1 + FLOOR(RANDOM() * 4)],
        FLOOR(RANDOM() * 200) + 10
      );
    END LOOP;
  END LOOP;
END $$;
