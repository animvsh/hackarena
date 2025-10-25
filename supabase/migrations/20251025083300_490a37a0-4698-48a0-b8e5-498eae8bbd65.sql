-- Fix search_path for generate_team_invite_code function
DROP FUNCTION IF EXISTS generate_team_invite_code();

CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'hc_live_' || encode(gen_random_bytes(24), 'hex');
  RETURN code;
END;
$$;