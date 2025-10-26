-- Add GitHub OAuth fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_github_sync TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_github_id ON public.users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_github_verified ON public.users(github_verified);

-- Add comments explaining the fields
COMMENT ON COLUMN public.users.github_id IS 'GitHub user ID from OAuth';
COMMENT ON COLUMN public.users.github_username IS 'GitHub username from OAuth';
COMMENT ON COLUMN public.users.github_access_token IS 'SENSITIVE: GitHub OAuth access token - should be encrypted. Only accessible via service role.';
COMMENT ON COLUMN public.users.github_verified IS 'Whether GitHub account has been verified via OAuth';
COMMENT ON COLUMN public.users.last_github_sync IS 'Timestamp of last GitHub repository sync';

-- SECURITY NOTES for GitHub OAuth implementation:
--
-- 1. github_access_token is SENSITIVE and should NEVER be returned to frontend
--    - Frontend code must NOT select this column
--    - Only edge functions with service role should access it
--
-- 2. Token should be encrypted at rest (TODO for production):
--    - Option A: Use Supabase Vault (recommended)
--    - Option B: Use pgcrypto extension
--    - For now: Relying on database encryption + access control
--
-- 3. RLS on users table:
--    - Existing RLS policies on users table handle basic access control
--    - Users can only update their own data (id = auth.uid())
--    - Frontend explicitly excludes github_access_token from SELECT queries
--
-- 4. Edge functions:
--    - Use service role key to bypass RLS
--    - Validate token before use
--    - Handle token expiration gracefully
