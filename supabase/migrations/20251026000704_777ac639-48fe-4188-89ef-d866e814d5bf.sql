-- Add hackathon_id to prediction_markets
ALTER TABLE prediction_markets 
ADD COLUMN hackathon_id uuid REFERENCES hackathons(id);

CREATE INDEX idx_prediction_markets_hackathon 
ON prediction_markets(hackathon_id);

-- Add hackathon_id to broadcast_state
ALTER TABLE broadcast_state 
ADD COLUMN hackathon_id uuid REFERENCES hackathons(id);

-- Remove singleton constraint to allow multiple hackathon broadcasts
ALTER TABLE broadcast_state 
DROP CONSTRAINT IF EXISTS broadcast_state_singleton_check;

-- Add hackathon_id to broadcast_content
ALTER TABLE broadcast_content 
ADD COLUMN hackathon_id uuid REFERENCES hackathons(id);

CREATE INDEX idx_broadcast_content_hackathon 
ON broadcast_content(hackathon_id);

-- Add hackathon_id to commentary_feed
ALTER TABLE commentary_feed 
ADD COLUMN hackathon_id uuid REFERENCES hackathons(id);

-- Add hackathon_id to teams
ALTER TABLE teams 
ADD COLUMN hackathon_id uuid REFERENCES hackathons(id);

CREATE INDEX idx_teams_hackathon 
ON teams(hackathon_id);