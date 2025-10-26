import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  total_participants: number;
  website: string;
}

export function useCurrentHackathon(hackathonId?: string) {
  const { data: hackathon = null, isLoading: loading } = useOptimizedQuery<Hackathon>({
    queryKey: ['hackathon', hackathonId || 'none'],
    customFn: async () => {
      if (!hackathonId) return null as any;
      
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', hackathonId)
        .single();

      if (error) throw error;
      return data as Hackathon;
    },
    enabled: !!hackathonId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { hackathon, loading };
}
