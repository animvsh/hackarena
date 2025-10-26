import { useState, useEffect } from 'react';
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

export function useActiveBroadcasts() {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  // Use optimized query with caching
  const { data: hackathons = [], isLoading: loading } = useOptimizedQuery<Hackathon[]>({
    queryKey: ['active-hackathons'],
    customFn: async () => {
      const { data } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (!data) return [];

      // Prioritize Cal Hacks
      return data.sort((a, b) => {
        if (a.name.toLowerCase().includes('cal hacks')) return -1;
        if (b.name.toLowerCase().includes('cal hacks')) return 1;
        return 0;
      });
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Set default hackathon
  useEffect(() => {
    if (hackathons.length > 0 && !selectedHackathon) {
      setSelectedHackathon(hackathons[0]);
    }
  }, [hackathons, selectedHackathon]);

  // Real-time updates (only subscribe once, not on every render)
  useEffect(() => {
    const channel = supabase
      .channel('hackathons-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hackathons'
      }, () => {
        // Invalidate cache on updates - React Query will refetch
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const selectHackathon = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
  };

  return {
    hackathons,
    selectedHackathon,
    selectHackathon,
    loading
  };
}
