import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BroadcastEvent } from '@/types/broadcastEvent';

export function useBroadcastEvents(onEvent: (event: BroadcastEvent) => void) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setIsListening(true);

    // Listen to new predictions (bets)
    const predictionsChannel = supabase
      .channel('predictions-broadcast')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions'
        },
        async (payload) => {
          const prediction = payload.new;
          
          // Fetch team name
          const { data: teamData } = await supabase
            .from('hackathon_teams')
            .select('name')
            .eq('id', prediction.team_id)
            .single();

          const event: BroadcastEvent = {
            id: prediction.id,
            type: 'bet_placed',
            priority: prediction.amount > 500 ? 'breaking' : 'normal',
            teamName: teamData?.name || 'Unknown Team',
            teamId: prediction.team_id,
            metricType: 'bet',
            currentValue: prediction.amount,
            change: prediction.amount,
            timestamp: new Date().toISOString(),
            metadata: {
              odds: prediction.odds_at_bet,
              marketId: prediction.market_id
            }
          };

          onEvent(event);
        }
      )
      .subscribe();

    // Listen to odds changes
    const oddsChannel = supabase
      .channel('odds-broadcast')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_odds'
        },
        async (payload) => {
          const oldOdds = payload.old.current_odds;
          const newOdds = payload.new.current_odds;
          const change = newOdds - oldOdds;

          // Only broadcast significant changes (> 5%)
          if (Math.abs(change) < 5) return;

          const { data: teamData } = await supabase
            .from('hackathon_teams')
            .select('name')
            .eq('id', payload.new.team_id)
            .single();

          const event: BroadcastEvent = {
            id: payload.new.id,
            type: 'odds_change',
            priority: Math.abs(change) > 15 ? 'breaking' : 'normal',
            teamName: teamData?.name || 'Unknown Team',
            teamId: payload.new.team_id,
            metricType: 'odds',
            currentValue: newOdds,
            change: change,
            timestamp: new Date().toISOString(),
            metadata: {
              marketId: payload.new.market_id
            }
          };

          onEvent(event);
        }
      )
      .subscribe();

    // Listen to team updates
    const teamsChannel = supabase
      .channel('teams-broadcast')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams'
        },
        async (payload) => {
          const oldProgress = payload.old.current_progress;
          const newProgress = payload.new.current_progress;
          const change = newProgress - oldProgress;

          // Only broadcast meaningful progress changes
          if (change <= 0) return;

          const event: BroadcastEvent = {
            id: payload.new.id,
            type: 'team_update',
            priority: change >= 10 ? 'breaking' : 'normal',
            teamName: payload.new.name,
            teamId: payload.new.id,
            metricType: 'progress',
            currentValue: newProgress,
            change: change,
            timestamp: new Date().toISOString()
          };

          onEvent(event);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(predictionsChannel);
      supabase.removeChannel(oddsChannel);
      supabase.removeChannel(teamsChannel);
      setIsListening(false);
    };
  }, [onEvent]);

  return { isListening };
}
