import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamOdds {
  team_id: string;
  team_name: string;
  current_odds: number;
  volume: number;
  last_updated: string;
}

export interface OddsHistoryPoint {
  timestamp: string;
  odds: number;
  volume: number;
}

export function useMarketOdds(marketId: string | undefined) {
  const [odds, setOdds] = useState<TeamOdds[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) return;

    const fetchOdds = async () => {
      const { data, error } = await supabase
        .from('market_odds')
        .select(`
          team_id,
          current_odds,
          volume,
          last_updated,
          teams (name)
        `)
        .eq('market_id', marketId)
        .order('current_odds', { ascending: false });

      if (!error && data) {
        setOdds(data.map(item => ({
          team_id: item.team_id,
          team_name: (item.teams as any)?.name || 'Unknown',
          current_odds: Number(item.current_odds),
          volume: item.volume,
          last_updated: item.last_updated
        })));
      }
      setLoading(false);
    };

    fetchOdds();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`market-odds-${marketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'market_odds',
        filter: `market_id=eq.${marketId}`
      }, () => {
        fetchOdds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  return { odds, loading };
}
