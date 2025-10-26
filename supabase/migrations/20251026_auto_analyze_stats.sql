-- Automatically analyze and update team member stats every 10 minutes

-- Create a function to analyze stats for all teams (called by cron)
CREATE OR REPLACE FUNCTION auto_analyze_teams()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  team_rec RECORD;
  request_id BIGINT;
BEGIN
  -- Loop through teams and trigger analysis
  FOR team_rec IN 
    SELECT DISTINCT ht.id, ht.hackathon_id, ht.name
    FROM hackathon_teams ht
    JOIN hackathon_team_members htm ON ht.id = htm.team_id
    JOIN hackers h ON htm.hacker_id = h.id
    WHERE ht.team_size > 0
      AND h.github_username IS NOT NULL
      AND h.github_username != ''
    LIMIT 3 -- Process 3 teams per run to avoid rate limits
  LOOP
    BEGIN
      -- Call the edge function using pg_net
      SELECT net.http_post(
        url:='https://jqdfjcpgevgajdljckur.supabase.co/functions/v1/analyze-github-stats',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=json_build_object(
          'teamId', team_rec.id,
          'hackathonId', team_rec.hackathon_id
        )::jsonb
      ) INTO request_id;
      
      RAISE NOTICE 'Analyzed team: % (request_id: %)', team_rec.name, request_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to analyze team %: %', team_rec.name, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Schedule the job to run every 10 minutes
SELECT cron.schedule(
  'auto-analyze-team-stats',
  '*/10 * * * *', -- every 10 minutes
  'SELECT auto_analyze_teams();'
);

-- Also create a function to manually trigger analysis for all teams
CREATE OR REPLACE FUNCTION trigger_stats_analysis()
RETURNS TABLE(team_id UUID, team_name TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  team_record RECORD;
  response_text TEXT;
BEGIN
  FOR team_record IN 
    SELECT ht.id, ht.name, ht.hackathon_id
    FROM hackathon_teams ht
    WHERE ht.team_size > 0
    LIMIT 50
  LOOP
    BEGIN
      -- Call the edge function
      PERFORM net.http_post(
        url:='https://jqdfjcpgevgajdljckur.supabase.co/functions/v1/analyze-github-stats',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=json_build_object(
          'teamId', team_record.id,
          'hackathonId', team_record.hackathon_id
        )::jsonb
      );
      
      -- Return success
      RETURN QUERY SELECT team_record.id, team_record.name, 'queued'::TEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Return error
      RETURN QUERY SELECT team_record.id, team_record.name, 'failed'::TEXT;
    END;
  END LOOP;
END;
$$;

