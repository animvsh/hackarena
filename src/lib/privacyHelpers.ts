import { supabase } from '@/integrations/supabase/client';

export async function checkSharedTeams(
  currentUserId: string | undefined,
  profileUserId: string
): Promise<boolean> {
  if (!currentUserId) return false;

  try {
    // Check manually for shared teams
    const { data: currentUserTeams } = await supabase
      .from('team_permissions')
      .select('team_id')
      .eq('user_id', currentUserId);

    const teamIds = currentUserTeams?.map(t => t.team_id) || [];

    if (teamIds.length === 0) return false;

    const { data: sharedTeams } = await supabase
      .from('team_permissions')
      .select('team_id')
      .eq('user_id', profileUserId)
      .in('team_id', teamIds);

    return (sharedTeams?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking shared teams:', error);
    return false;
  }
}

export function canViewSection(
  privacySettings: any,
  section: string,
  hasSharedTeam: boolean,
  isOwnProfile: boolean
): boolean {
  if (isOwnProfile) return true;

  const setting = privacySettings?.[section] || 'public';

  if (setting === 'public') return true;
  if (setting === 'private') return false;
  if (setting === 'team_only') return hasSharedTeam;

  return true; // Default to public
}
