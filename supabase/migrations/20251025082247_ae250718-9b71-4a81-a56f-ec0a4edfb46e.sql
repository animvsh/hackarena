-- Add new columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_type TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Team invite codes (like API keys)
CREATE TABLE team_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Team join requests (approval workflow)
CREATE TABLE team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code_id UUID REFERENCES team_invite_codes(id),
  status TEXT DEFAULT 'pending',
  message TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team ownership & permissions
CREATE TABLE team_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  can_manage_members BOOLEAN DEFAULT false,
  can_manage_integrations BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team company profile & type
CREATE TABLE team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_type TEXT,
  industry TEXT,
  business_model TEXT,
  target_metrics JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected data sources
CREATE TABLE team_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  credentials_encrypted TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'realtime',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  connected_by UUID REFERENCES auth.users(id) NOT NULL,
  UNIQUE(team_id, integration_type, integration_name)
);

-- Metrics collected from integrations
CREATE TABLE integration_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES team_integrations(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_metadata JSONB,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logging
CREATE TABLE team_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE team_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_permissions
CREATE POLICY "Team members can view their team permissions"
  ON team_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can manage team permissions"
  ON team_permissions FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions 
    WHERE user_id = auth.uid() AND (role = 'owner' OR can_manage_members = true)
  ));

-- RLS Policies for team_invite_codes
CREATE POLICY "Team members can view invite codes"
  ON team_invite_codes FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can manage invite codes"
  ON team_invite_codes FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions 
    WHERE user_id = auth.uid() AND (role = 'owner' OR can_manage_members = true)
  ));

-- RLS Policies for team_join_requests
CREATE POLICY "Users can view their own join requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create join requests"
  ON team_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage join requests"
  ON team_join_requests FOR UPDATE
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions 
    WHERE user_id = auth.uid() AND (role = 'owner' OR can_manage_members = true)
  ));

CREATE POLICY "Owners can view team join requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions 
    WHERE user_id = auth.uid() AND (role = 'owner' OR can_manage_members = true)
  ));

-- RLS Policies for team_profiles
CREATE POLICY "Team members can view team profile"
  ON team_profiles FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can manage team profile"
  ON team_profiles FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- RLS Policies for team_integrations
CREATE POLICY "Team members can view integrations"
  ON team_integrations FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Managers can manage integrations"
  ON team_integrations FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions 
    WHERE user_id = auth.uid() AND (role = 'owner' OR can_manage_integrations = true)
  ));

-- RLS Policies for integration_metrics
CREATE POLICY "Team members can view integration metrics"
  ON integration_metrics FOR SELECT
  TO authenticated
  USING (integration_id IN (
    SELECT ti.id FROM team_integrations ti
    JOIN team_permissions tp ON ti.team_id = tp.team_id
    WHERE tp.user_id = auth.uid() AND tp.can_view_analytics = true
  ));

-- RLS Policies for team_audit_logs
CREATE POLICY "Team members can view audit logs"
  ON team_audit_logs FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_permissions WHERE user_id = auth.uid()
  ));

-- Function to generate secure invite code
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'hc_live_' || encode(gen_random_bytes(24), 'hex');
  RETURN code;
END;
$$;

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE team_join_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE team_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE team_integrations;