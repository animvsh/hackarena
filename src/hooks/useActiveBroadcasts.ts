import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveHackathons();

    // Subscribe to hackathon changes
    const channel = supabase
      .channel('hackathons-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hackathons'
      }, fetchActiveHackathons)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveHackathons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hackathons')
      .select('*')
      .eq('status', 'active')
      .order('start_date', { ascending: false });

    if (data) {
      // Prioritize Cal Hacks
      const sorted = data.sort((a, b) => {
        if (a.name.toLowerCase().includes('cal hacks')) return -1;
        if (b.name.toLowerCase().includes('cal hacks')) return 1;
        return 0;
      });

      setHackathons(sorted);
      
      // Set default to first (Cal Hacks if exists)
      if (sorted.length > 0 && !selectedHackathon) {
        setSelectedHackathon(sorted[0]);
      }
    }
    setLoading(false);
  };

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
