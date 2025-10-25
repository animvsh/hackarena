-- Fix security warnings by setting search_path on existing functions

-- Fix update_market_odds function
CREATE OR REPLACE FUNCTION public.update_market_odds(p_market_id uuid, p_team_id uuid, p_bet_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix update_team_momentum function
CREATE OR REPLACE FUNCTION public.update_team_momentum()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE teams
  SET momentum_score = LEAST(100, momentum_score + (NEW.impact_score * 0.5)),
      updated_at = NOW()
  WHERE id = NEW.team_id;

  RETURN NEW;
END;
$function$;