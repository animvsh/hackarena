-- Fix infinite recursion in team_permissions RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Owners can manage team permissions" ON public.team_permissions;
DROP POLICY IF EXISTS "Team members can view their team permissions" ON public.team_permissions;

-- Create a security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_permissions
    WHERE team_id = _team_id 
      AND user_id = _user_id
  )
$$;

-- Create a security definer function to check if user can manage team
CREATE OR REPLACE FUNCTION public.can_manage_team(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_permissions
    WHERE team_id = _team_id 
      AND user_id = _user_id
      AND (role = 'owner' OR can_manage_members = true)
  )
$$;

-- Recreate policies using the security definer functions
CREATE POLICY "Owners can manage team permissions" 
ON public.team_permissions
FOR ALL
USING (public.can_manage_team(team_id, auth.uid()));

CREATE POLICY "Team members can view their team permissions" 
ON public.team_permissions
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_team_member(team_id, auth.uid())
);