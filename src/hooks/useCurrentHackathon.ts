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

export function useCurrentHackathon(hackathonId?: string) {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hackathonId) {
      setLoading(false);
      return;
    }

    const fetchHackathon = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', hackathonId)
        .single();

      if (data && !error) {
        setHackathon(data as Hackathon);
      }
      setLoading(false);
    };

    fetchHackathon();
  }, [hackathonId]);

  return { hackathon, loading };
}
