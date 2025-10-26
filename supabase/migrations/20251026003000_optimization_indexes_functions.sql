-- Performance Optimization Migration
-- Adds composite indexes and optimized database functions

-- ============================================
-- COMPOSITE INDEXES FOR QUERY OPTIMIZATION
-- ============================================

-- Market odds lookup optimization (used heavily in betting)
CREATE INDEX IF NOT EXISTS idx_market_odds_market_team
ON market_odds(market_id, team_id);

-- Predictions lookup by user and date
CREATE INDEX IF NOT EXISTS idx_predictions_user_created
ON predictions(user_id, created_at DESC);

-- Teams filtering by status and hackathon
CREATE INDEX IF NOT EXISTS idx_teams_status_hackathon
ON teams(status, hackathon_id) WHERE status = 'active';

-- Market odds by hackathon and status
CREATE INDEX IF NOT EXISTS idx_prediction_markets_hackathon_status
ON prediction_markets(hackathon_id, status) WHERE status = 'open';

-- Commentary feed by hackathon
CREATE INDEX IF NOT EXISTS idx_commentary_feed_hackathon_created
ON commentary_feed(hackathon_id, created_at DESC);

-- ============================================
-- OPTIMIZED DATABASE FUNCTIONS
-- ============================================

-- Function to recalculate market odds atomically
CREATE OR REPLACE FUNCTION recalculate_market_odds(p_market_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  total_volume BIGINT;
BEGIN
  -- Calculate total volume for this market
  SELECT SUM(volume) INTO total_volume
  FROM market_odds
  WHERE market_id = p_market_id;

  -- Update all odds atomically
  UPDATE market_odds
  SET
    current_odds = CASE
      WHEN total_volume > 0 THEN (volume::DECIMAL / total_volume) * 100
      ELSE 0
    END,
    last_updated = NOW()
  WHERE market_id = p_market_id;
END;
$$;

-- Optimized function to place a bet with atomic updates
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_market_id UUID,
  p_team_id UUID,
  p_amount INTEGER,
  p_current_odds DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_prediction_id UUID;
  v_user_balance INTEGER;
  v_result JSON;
BEGIN
  -- Check user balance
  SELECT wallet_balance INTO v_user_balance
  FROM users
  WHERE id = p_user_id;

  IF v_user_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Start transaction
  -- Insert prediction
  INSERT INTO predictions (user_id, market_id, team_id, amount, odds_at_bet)
  VALUES (p_user_id, p_market_id, p_team_id, p_amount, p_current_odds)
  RETURNING id INTO v_prediction_id;

  -- Update market odds volume
  UPDATE market_odds
  SET
    volume = volume + p_amount,
    last_updated = NOW()
  WHERE market_id = p_market_id
    AND team_id = p_team_id;

  -- Recalculate all odds for this market
  PERFORM recalculate_market_odds(p_market_id);

  -- Update user balance
  UPDATE users
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;

  -- Return result
  SELECT json_build_object(
    'prediction_id', v_prediction_id,
    'success', true,
    'new_balance', wallet_balance
  ) INTO v_result
  FROM users
  WHERE id = p_user_id;

  RETURN v_result;
END;
$$;

-- Function to get user wallet balance safely
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(wallet_balance, 0)
  FROM users
  WHERE id = p_user_id;
$$;

-- ============================================
-- MATERIALIZED VIEW FOR DASHBOARD STATS
-- ============================================

-- Create materialized view for frequently accessed stats
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  h.id as hackathon_id,
  COUNT(DISTINCT t.id) as active_teams,
  COUNT(DISTINCT p.id) as total_predictions,
  COALESCE(SUM(mo.volume), 0) as total_volume,
  COUNT(DISTINCT CASE WHEN pm.status = 'open' THEN pm.id END) as open_markets
FROM hackathons h
LEFT JOIN teams t ON t.hackathon_id = h.id AND t.status = 'active'
LEFT JOIN prediction_markets pm ON pm.hackathon_id = h.id
LEFT JOIN predictions p ON p.market_id = pm.id
LEFT JOIN market_odds mo ON mo.market_id = pm.id
WHERE h.status = 'active'
GROUP BY h.id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_hackathon
ON dashboard_stats(hackathon_id);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION recalculate_market_odds IS 'Atomically recalculates odds for all teams in a market';
COMMENT ON FUNCTION place_bet IS 'Places a bet with atomic balance check, prediction insert, and odds update';
COMMENT ON FUNCTION get_user_balance IS 'Safely retrieves user wallet balance';
COMMENT ON FUNCTION refresh_dashboard_stats IS 'Refreshes materialized view for dashboard statistics';
