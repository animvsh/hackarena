-- Add devpost_url field to hackathons table to track import source
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS devpost_url TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hackathons_devpost_url ON hackathons(devpost_url);

-- Add comment for documentation
COMMENT ON COLUMN hackathons.devpost_url IS 'Original Devpost URL if hackathon was imported from Devpost';