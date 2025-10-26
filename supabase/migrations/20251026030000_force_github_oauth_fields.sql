-- Force add GitHub OAuth fields to users table (idempotent)
-- This migration ensures GitHub OAuth columns exist regardless of migration history issues

DO $$
BEGIN
  -- Add github_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'github_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN github_id TEXT;
  END IF;

  -- Add github_username if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'github_username'
  ) THEN
    ALTER TABLE public.users ADD COLUMN github_username TEXT;
  END IF;

  -- Add github_access_token if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'github_access_token'
  ) THEN
    ALTER TABLE public.users ADD COLUMN github_access_token TEXT;
  END IF;

  -- Add github_verified if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'github_verified'
  ) THEN
    ALTER TABLE public.users ADD COLUMN github_verified BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add last_github_sync if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_github_sync'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_github_sync TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_github_id ON public.users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_github_verified ON public.users(github_verified);

-- Add comments
COMMENT ON COLUMN public.users.github_id IS 'GitHub user ID from OAuth';
COMMENT ON COLUMN public.users.github_username IS 'GitHub username from OAuth';
COMMENT ON COLUMN public.users.github_access_token IS 'SENSITIVE: GitHub OAuth access token - should be encrypted';
COMMENT ON COLUMN public.users.github_verified IS 'Whether GitHub account has been verified via OAuth';
COMMENT ON COLUMN public.users.last_github_sync IS 'Timestamp of last GitHub repository sync';
