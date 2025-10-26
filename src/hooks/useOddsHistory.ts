import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OddsHistoryPoint } from './useMarketOdds';

export function useOddsHistory(teamId: string | undefined, marketId: string | undefined) {
  const [history, setHistory] = useState<OddsHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId || !marketId) return;

    const fetchHistory = async () => {
      setLoading(true);
      
      // Fetch last 24 hours of historical data
      const { data, error } = await supabase
        .from('odds_history')
        .select('odds, volume, timestamp')
        .eq('market_id', marketId)
        .eq('team_id', teamId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      if (!error && data && data.length > 0) {
        setHistory(data.map(item => ({
          timestamp: item.timestamp,
          odds: Number(item.odds),
          volume: item.volume
        })));
      } else {
        // Fallback: If no historical data, get current data point
        const { data: currentData } = await supabase
          .from('market_odds')
          .select('current_odds, volume, last_updated')
          .eq('market_id', marketId)
          .eq('team_id', teamId)
          .single();

        if (currentData) {
          setHistory([{
            timestamp: currentData.last_updated,
            odds: Number(currentData.current_odds),
            volume: currentData.volume
          }]);
        }
      }
      
      setLoading(false);
    };

    fetchHistory();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`odds-history-${teamId}-${marketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'odds_history',
        filter: `team_id=eq.${teamId}`
      }, () => {
        fetchHistory(); // Refresh on new data
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, marketId]);

  return { history, loading };
}
