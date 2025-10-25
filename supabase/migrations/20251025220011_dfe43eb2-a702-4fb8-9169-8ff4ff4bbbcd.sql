-- Create notifications table for real-time user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create team_invites table for tracking team invitations
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_user_id UUID REFERENCES auth.users(id),
  invite_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Enable RLS on team_invites
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team managers can create invites"
  ON public.team_invites FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_permissions 
      WHERE user_id = auth.uid() 
      AND (role = 'owner' OR can_manage_members = true)
    )
  );

CREATE POLICY "Invited users can view their invites"
  ON public.team_invites FOR SELECT
  USING (
    invited_user_id = auth.uid() OR
    invite_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team members can view team invites"
  ON public.team_invites FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_permissions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Inviter can update their invites"
  ON public.team_invites FOR UPDATE
  USING (invited_by = auth.uid());

-- Enhance users table for rich profiles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_generated_by TEXT;