import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  logo_url?: string | null;
  tagline?: string | null;
  category?: string[] | null;
  momentum_score?: number;
  team_size?: number;
}

interface TeamMembership {
  id: string;
  role: string;
  can_manage_members?: boolean;
  teams: Team;
}

export function useTeamMemberships(userId: string | undefined) {
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMemberships = async () => {
      try {
        const { data, error } = await supabase
          .from('team_permissions')
          .select(`
            id,
            role,
            can_manage_members,
            teams (
              id,
              name,
              logo_url,
              tagline,
              category,
              momentum_score,
              team_size
            )
          `)
          .eq('user_id', userId);

        if (error) throw error;

        setMemberships(data as TeamMembership[] || []);
      } catch (error) {
        console.error('Error fetching team memberships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [userId]);

  return { memberships, loading };
}
