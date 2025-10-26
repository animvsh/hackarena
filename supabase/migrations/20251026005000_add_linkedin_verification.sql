-- Add LinkedIn verification and profile enrichment fields to users table

-- Add LinkedIn verification tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS linkedin_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_enrichment_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_profile_sync TIMESTAMPTZ;

-- Add index for verified users lookup
CREATE INDEX IF NOT EXISTS idx_users_linkedin_verified
ON public.users(linkedin_verified) WHERE linkedin_verified = TRUE;

-- Add index for LinkedIn ID lookup
CREATE INDEX IF NOT EXISTS idx_users_linkedin_id
ON public.users(linkedin_id) WHERE linkedin_id IS NOT NULL;

-- Add check constraint for enrichment source
ALTER TABLE public.users
ADD CONSTRAINT check_enrichment_source
CHECK (profile_enrichment_source IN ('manual', 'linkedin', 'resume', 'github'));

-- Comment on new columns
COMMENT ON COLUMN public.users.linkedin_verified IS 'Whether the user has verified their LinkedIn account via OAuth';
COMMENT ON COLUMN public.users.linkedin_id IS 'Unique LinkedIn user ID from OAuth';
COMMENT ON COLUMN public.users.profile_enrichment_source IS 'Source of profile data: manual, linkedin, resume, or github';
COMMENT ON COLUMN public.users.last_profile_sync IS 'Timestamp of last LinkedIn profile sync';
