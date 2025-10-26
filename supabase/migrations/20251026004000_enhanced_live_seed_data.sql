-- Enhanced Seed Data for HackCast LIVE Simulation
-- Creates a complete live hackathon environment with teams, users, and real-time data

-- Create active hackathon
INSERT INTO hackathons (name, location, start_date, end_date, status, prize_pool, total_participants, description, website)
VALUES (
  'HackCast LIVE Demo 2025',
  'San Francisco, CA',
  NOW() - INTERVAL '12 hours',
  NOW() + INTERVAL '36 hours',
  'active',
  75000,
  80,
  'The ultimate AI x FinTech hackathon featuring live prediction markets and real-time commentary',
  'https://hackcast.live'
) ON CONFLICT DO NOTHING;

-- Get the hackathon ID for reference
DO $$
DECLARE
  hackathon_id UUID;
  anthropic_id UUID;
  visa_id UUID;
  chroma_id UUID;
  livekit_id UUID;
  supabase_id UUID;
  team_ids UUID[];
  user_ids UUID[];
  market_ids UUID[];
BEGIN
  -- Get hackathon ID
  SELECT id INTO hackathon_id FROM hackathons WHERE name = 'HackCast LIVE Demo 2025' LIMIT 1;

  -- Get sponsor IDs
  SELECT id INTO anthropic_id FROM sponsors WHERE name = 'Anthropic' LIMIT 1;
  SELECT id INTO visa_id FROM sponsors WHERE name = 'Visa' LIMIT 1;
  SELECT id INTO chroma_id FROM sponsors WHERE name = 'Chroma' LIMIT 1;
  SELECT id INTO livekit_id FROM sponsors WHERE name = 'LiveKit' LIMIT 1;
  SELECT id INTO supabase_id FROM sponsors WHERE name = 'Supabase' LIMIT 1;

  -- Insert additional users (total 20)
  INSERT INTO users (username, email, avatar_url, wallet_balance, xp, bio, skills) VALUES
  ('emma_builds', 'emma@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 2200, 450, 'Full-stack developer passionate about AI', '[{"name": "React"}, {"name": "Python"}]'::jsonb),
  ('frank_codes', 'frank@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank', 1900, 380, 'FinTech specialist', '[{"name": "TypeScript"}, {"name": "Blockchain"}]'::jsonb),
  ('grace_dev', 'grace@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', 1600, 310, 'UI/UX engineer', '[{"name": "Figma"}, {"name": "React"}]'::jsonb),
  ('henry_tech', 'henry@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry', 2500, 520, 'AI researcher', '[{"name": "TensorFlow"}, {"name": "Claude"}]'::jsonb),
  ('iris_hacks', 'iris@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iris', 1400, 290, 'Mobile developer', '[{"name": "Flutter"}, {"name": "Swift"}]'::jsonb),
  ('jack_builder', 'jack@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', 1700, 340, 'DevOps engineer', '[{"name": "Docker"}, {"name": "Kubernetes"}]'::jsonb),
  ('kate_creates', 'kate@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate', 2100, 470, 'Data scientist', '[{"name": "Python"}, {"name": "SQL"}]'::jsonb),
  ('leo_dev', 'leo@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', 1800, 360, 'Backend specialist', '[{"name": "Node.js"}, {"name": "PostgreSQL"}]'::jsonb),
  ('mia_codes', 'mia@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', 2300, 490, 'Blockchain developer', '[{"name": "Solidity"}, {"name": "Web3"}]'::jsonb),
  ('noah_builds', 'noah@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', 1500, 280, 'Cloud architect', '[{"name": "AWS"}, {"name": "Supabase"}]'::jsonb),
  ('olivia_tech', 'olivia@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', 2000, 420, 'Security specialist', '[{"name": "Cybersecurity"}, {"name": "Rust"}]'::jsonb),
  ('peter_hacker', 'peter@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter', 1300, 260, 'Game developer', '[{"name": "Unity"}, {"name": "C#"}]'::jsonb),
  ('quinn_dev', 'quinn@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn', 1900, 410, 'ML engineer', '[{"name": "PyTorch"}, {"name": "Reka"}]'::jsonb),
  ('rachel_builds', 'rachel@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', 2400, 510, 'Platform engineer', '[{"name": "Go"}, {"name": "GraphQL"}]'::jsonb),
  ('sam_codes', 'sam@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', 1600, 320, 'AR/VR developer', '[{"name": "Three.js"}, {"name": "WebXR"}]'::jsonb),
  ('tara_tech', 'tara@hackcast.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tara', 2200, 460, 'API designer', '[{"name": "REST"}, {"name": "OpenAPI"}]'::jsonb)
  ON CONFLICT (email) DO NOTHING;

  -- Update existing teams to link to hackathon
  UPDATE teams SET hackathon_id = (SELECT id FROM hackathons WHERE name = 'HackCast LIVE Demo 2025' LIMIT 1) WHERE teams.hackathon_id IS NULL;

  -- Insert prediction markets linked to hackathon
  INSERT INTO prediction_markets (category, sponsor_id, prize_amount, total_pool, status, hackathon_id) VALUES
  ('Best AI Application', anthropic_id, 10000, 0, 'open', hackathon_id),
  ('Best FinTech Innovation', visa_id, 15000, 0, 'open', hackathon_id),
  ('Best Use of Vector DB', chroma_id, 5000, 0, 'open', hackathon_id),
  ('Best Real-time App', livekit_id, 8000, 0, 'open', hackathon_id),
  ('Best Overall Hack', NULL, 25000, 0, 'open', hackathon_id),
  ('Most Innovative UI', NULL, 7000, 0, 'open', hackathon_id),
  ('Best Developer Tool', NULL, 6000, 0, 'open', hackathon_id)
  ON CONFLICT DO NOTHING;

  -- Get market IDs
  SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO market_ids FROM (
    SELECT id, created_at FROM prediction_markets
    WHERE prediction_markets.hackathon_id = (SELECT id FROM hackathons WHERE name = 'HackCast LIVE Demo 2025' LIMIT 1)
    ORDER BY created_at DESC LIMIT 7
  ) AS recent_markets;

  -- Get team and user IDs for cross-referencing
  SELECT ARRAY_AGG(id) INTO team_ids FROM teams LIMIT 8;
  SELECT ARRAY_AGG(id) INTO user_ids FROM users LIMIT 20;

  -- Create market odds for all teams across all markets
  FOR i IN 1..ARRAY_LENGTH(market_ids, 1) LOOP
    FOR j IN 1..ARRAY_LENGTH(team_ids, 1) LOOP
      INSERT INTO market_odds (market_id, team_id, current_odds, volume)
      VALUES (
        market_ids[i],
        team_ids[j],
        (20 + RANDOM() * 40)::DECIMAL, -- Initial odds 20-60%
        (50 + RANDOM() * 300)::INTEGER  -- Initial volume 50-350
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Normalize odds for each market to sum to 100
  FOR i IN 1..ARRAY_LENGTH(market_ids, 1) LOOP
    UPDATE market_odds mo
    SET current_odds = (mo.current_odds / market_total.total) * 100
    FROM (
      SELECT SUM(current_odds) as total
      FROM market_odds
      WHERE market_id = market_ids[i]
    ) market_total
    WHERE mo.market_id = market_ids[i];
  END LOOP;

  -- Insert realistic predictions (100 initial bets)
  FOR i IN 1..100 LOOP
    INSERT INTO predictions (
      user_id,
      market_id,
      team_id,
      amount,
      odds_at_bet,
      status,
      created_at
    )
    VALUES (
      user_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(user_ids, 1))],
      market_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(market_ids, 1))],
      team_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(team_ids, 1))],
      (50 + RANDOM() * 450)::INTEGER, -- Bets between 50-500 HC
      (20 + RANDOM() * 60)::DECIMAL,  -- Historical odds
      CASE
        WHEN RANDOM() < 0.7 THEN 'pending'
        WHEN RANDOM() < 0.85 THEN 'won'
        ELSE 'lost'
      END,
      NOW() - (RANDOM() * INTERVAL '12 hours')
    );
  END LOOP;

  -- Insert progress updates for all teams
  FOR i IN 1..ARRAY_LENGTH(team_ids, 1) LOOP
    -- Each team gets 8-15 progress updates
    FOR j IN 1..(8 + FLOOR(RANDOM() * 7)) LOOP
      INSERT INTO progress_updates (
        team_id,
        type,
        title,
        content,
        impact_score,
        created_at
      )
      VALUES (
        team_ids[i],
        (ARRAY['commit', 'screenshot', 'milestone', 'tweet'])[1 + FLOOR(RANDOM() * 4)],
        CASE FLOOR(RANDOM() * 4)
          WHEN 0 THEN 'Pushed ' || (1 + FLOOR(RANDOM() * 25))::TEXT || ' commits'
          WHEN 1 THEN 'Updated ' || (ARRAY['UI', 'API', 'database', 'authentication'])[1 + FLOOR(RANDOM() * 4)]
          WHEN 2 THEN 'Completed ' || (ARRAY['MVP', 'integration', 'testing', 'deployment'])[1 + FLOOR(RANDOM() * 4)]
          ELSE 'Milestone: ' || (ARRAY['First demo', 'Beta launch', 'User testing', 'API live'])[1 + FLOOR(RANDOM() * 4)]
        END,
        'Team making solid progress on their hackathon project',
        (1 + FLOOR(RANDOM() * 15))::INTEGER,
        NOW() - (RANDOM() * INTERVAL '12 hours')
      );
    END LOOP;
  END LOOP;

  -- Insert live commentary feed (30 messages)
  INSERT INTO commentary_feed (text, voice_persona, event_type, hackathon_id, created_at) VALUES
  ('Welcome to HackCast LIVE! We have 8 incredible teams competing for $75,000 in prizes!', 'Analyst Ava', 'general', hackathon_id, NOW() - INTERVAL '11 hours'),
  ('Team VisionAI taking an early lead with their accessibility tech. This could be huge!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '10 hours 45 min'),
  ('Breaking: BytePay just integrated Visa API in record time! Odds surging!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '10 hours 20 min'),
  ('NeuralForge pushing 20 commits in the last hour. The grind is real!', 'Analyst Ava', 'milestone', hackathon_id, NOW() - INTERVAL '9 hours 50 min'),
  ('Market update: $12,000 in total bets placed so far. The crowd is betting big!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '9 hours 15 min'),
  ('StreamSync demonstrating real-time collaboration features. LiveKit integration looking smooth!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '8 hours 40 min'),
  ('DataVault hitting privacy milestones. Chroma DB queries flying!', 'Analyst Ava', 'milestone', hackathon_id, NOW() - INTERVAL '8 hours'),
  ('CodeMentor AI just shipped their Claude integration. Teaching AI to teach - meta!', 'Coach K', 'milestone', hackathon_id, NOW() - INTERVAL '7 hours 30 min'),
  ('FinFlow making moves in the FinTech category. Personal finance automation is 🔥', 'StatBot Reka', 'team_update', hackathon_id, NOW() - INTERVAL '7 hours'),
  ('Halfway point! VisionAI at 81% progress. Can anyone catch them?', 'Analyst Ava', 'general', hackathon_id, NOW() - INTERVAL '6 hours 30 min'),
  ('ChainForge implementing blockchain tracking. Supply chain revolution incoming!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '6 hours'),
  ('Odds shift alert: BytePay jumps 15% after demo! Crowd going wild!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '5 hours 30 min'),
  ('API usage stats: 1,247 Anthropic calls, 892 Visa API calls. Teams are building!', 'Analyst Ava', 'general', hackathon_id, NOW() - INTERVAL '5 hours'),
  ('VisionAI maintains lead but momentum slowing. Opening for others!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '4 hours 30 min'),
  ('Screenshot drop: NeuralForge UI looking absolutely gorgeous! 🎨', 'StatBot Reka', 'milestone', hackathon_id, NOW() - INTERVAL '4 hours'),
  ('StreamSync real-time features tested live on stream. Zero lag!', 'Analyst Ava', 'milestone', hackathon_id, NOW() - INTERVAL '3 hours 30 min'),
  ('Late surge from CodeMentor AI! They doubled their commit rate!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '3 hours'),
  ('Market volatility increasing. Smart money moving to underdogs!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '2 hours 30 min'),
  ('DataVault privacy compliance achieved. This is award-worthy work!', 'Analyst Ava', 'milestone', hackathon_id, NOW() - INTERVAL '2 hours'),
  ('BytePay live demo scheduled in 30 minutes. Odds climbing already!', 'Coach K', 'team_update', hackathon_id, NOW() - INTERVAL '90 minutes'),
  ('FinFlow mobile app deployed to TestFlight. End-to-end in 10 hours!', 'StatBot Reka', 'milestone', hackathon_id, NOW() - INTERVAL '75 minutes'),
  ('ChainForge blockchain nodes syncing. Decentralization in action!', 'Analyst Ava', 'team_update', hackathon_id, NOW() - INTERVAL '60 minutes'),
  ('Prediction markets heating up! 2,341 total bets, $45K in volume!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '45 minutes'),
  ('VisionAI accessibility demo brought tears. This helps real people!', 'Coach K', 'milestone', hackathon_id, NOW() - INTERVAL '30 minutes'),
  ('NeuralForge AI design tool generating production-ready code. Game changer!', 'Analyst Ava', 'milestone', hackathon_id, NOW() - INTERVAL '20 minutes'),
  ('StreamSync at 69% progress. Late bloomers making their move!', 'StatBot Reka', 'team_update', hackathon_id, NOW() - INTERVAL '15 minutes'),
  ('CodeMentor AI teaching itself new frameworks. The future is now!', 'Coach K', 'milestone', hackathon_id, NOW() - INTERVAL '10 minutes'),
  ('Final stretch begins! All teams pushing for the finish line!', 'Analyst Ava', 'general', hackathon_id, NOW() - INTERVAL '5 minutes'),
  ('Breaking: Massive 750 HC bet just placed on VisionAI! Whale alert!', 'StatBot Reka', 'market_shift', hackathon_id, NOW() - INTERVAL '2 minutes'),
  ('This is it folks! The most exciting hackathon finale of 2025!', 'Analyst Ava', 'general', hackathon_id, NOW() - INTERVAL '30 seconds');

  -- Update commentary feed for old entries to link to hackathon
  UPDATE commentary_feed SET hackathon_id = (SELECT id FROM hackathons WHERE name = 'HackCast LIVE Demo 2025' LIMIT 1) WHERE commentary_feed.hackathon_id IS NULL;

  -- Insert API usage data
  FOR i IN 1..ARRAY_LENGTH(team_ids, 1) LOOP
    -- Each team uses 2-4 sponsor APIs
    FOR j IN 1..(2 + FLOOR(RANDOM() * 2)) LOOP
      INSERT INTO api_usage (
        team_id,
        sponsor_id,
        endpoint,
        call_count,
        last_called
      )
      VALUES (
        team_ids[i],
        (ARRAY[anthropic_id, visa_id, chroma_id, livekit_id, supabase_id])[1 + FLOOR(RANDOM() * 5)],
        '/api/v1/' || (ARRAY['generate', 'search', 'analyze', 'process', 'authenticate', 'upload'])[1 + FLOOR(RANDOM() * 6)],
        (50 + FLOOR(RANDOM() * 500))::INTEGER,
        NOW() - (RANDOM() * INTERVAL '30 minutes')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

END $$;

-- Create indexes for performance (if not exist)
CREATE INDEX IF NOT EXISTS idx_teams_hackathon_status ON teams(hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_predictions_market_created ON predictions(market_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commentary_hackathon_created ON commentary_feed(hackathon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_team_created ON progress_updates(team_id, created_at DESC);

-- Grant permissions for real-time subscriptions (ignore if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE teams;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE market_odds;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE progress_updates;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE commentary_feed;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

COMMENT ON TABLE hackathons IS 'Hackathon events with teams, markets, and live data';
