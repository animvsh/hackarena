import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OddsHistoryPoint } from './useMarketOdds';

export function useOddsHistory(teamId: string | undefined, marketId: string | undefined) {
  const [history, setHistory] = useState<OddsHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId || !marketId) return;

    const fetchHistory = async () => {
      // For now, simulate history with current + some variance
      // In production, you'd query an odds_history table
      const { data, error } = await supabase
        .from('market_odds')
        .select('current_odds, volume, last_updated')
        .eq('market_id', marketId)
        .eq('team_id', teamId)
        .single();

      if (!error && data) {
        const currentOdds = Number(data.current_odds);
        const now = new Date();
        
        // Generate simulated 24h history
        const simulatedHistory: OddsHistoryPoint[] = [];
        for (let i = 24; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 10;
          simulatedHistory.push({
            timestamp: timestamp.toISOString(),
            odds: Math.max(0, Math.min(100, currentOdds + variance)),
            volume: data.volume + Math.floor(Math.random() * 100)
          });
        }
        
        setHistory(simulatedHistory);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [teamId, marketId]);

  return { history, loading };
}
