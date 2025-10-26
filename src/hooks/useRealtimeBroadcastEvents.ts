import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeBroadcastEvent {
  type: 'bet_placed' | 'odds_change' | 'team_update' | 'milestone' | 'breaking_news';
  teamName: string;
  metricType: string;
  currentValue: number;
  change: number;
  priority: 'breaking' | 'normal' | 'background';
  timestamp: string;
}

export function useRealtimeBroadcastEvents(
  onEvent: (event: RealtimeBroadcastEvent) => void
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const eventProcessedRef = useRef<Set<string>>(new Set());

  const handleDatabaseEvent = useCallback((payload: any) => {
    // Prevent duplicate processing
    const eventId = `${payload.table}-${payload.new?.id}-${payload.eventType}`;
    if (eventProcessedRef.current.has(eventId)) return;
    eventProcessedRef.current.add(eventId);

    // Clean up old event IDs (keep last 100)
    if (eventProcessedRef.current.size > 100) {
      const entries = Array.from(eventProcessedRef.current);
      eventProcessedRef.current = new Set(entries.slice(-50));
    }

    let event: RealtimeBroadcastEvent | null = null;

    // Process different table events
    switch (payload.table) {
      case 'predictions':
        event = {
          type: 'bet_placed',
          teamName: payload.new?.team_name || 'Unknown Team',
          metricType: 'Bet Amount',
          currentValue: payload.new?.amount || 0,
          change: payload.new?.amount || 0,
          priority: (payload.new?.amount > 500 ? 'breaking' : 'normal') as 'breaking' | 'normal',
          timestamp: payload.new?.created_at || new Date().toISOString()
        };
        break;

      case 'market_odds':
        const oddsChange = payload.new?.current_odds - (payload.old?.current_odds || payload.new?.current_odds);
        if (Math.abs(oddsChange) > 1) {
          event = {
            type: 'odds_change',
            teamName: payload.new?.team_name || 'Unknown Team',
            metricType: 'Market Odds',
            currentValue: payload.new?.current_odds || 0,
            change: oddsChange,
            priority: (Math.abs(oddsChange) > 10 ? 'breaking' : 'normal') as 'breaking' | 'normal',
            timestamp: payload.new?.last_updated || new Date().toISOString()
          };
        }
        break;

      case 'teams':
        const momentumChange = payload.new?.momentum_score - (payload.old?.momentum_score || payload.new?.momentum_score);
        if (Math.abs(momentumChange) > 5) {
          event = {
            type: 'team_update',
            teamName: payload.new?.name || 'Unknown Team',
            metricType: 'Momentum Score',
            currentValue: payload.new?.momentum_score || 0,
            change: momentumChange,
            priority: (Math.abs(momentumChange) > 15 ? 'breaking' : 'normal') as 'breaking' | 'normal',
            timestamp: payload.new?.updated_at || new Date().toISOString()
          };
        }
        break;

      case 'team_activities':
        event = {
          type: 'milestone',
          teamName: payload.new?.team_name || 'Unknown Team',
          metricType: payload.new?.activity_type || 'Activity',
          currentValue: payload.new?.impact_score || 0,
          change: payload.new?.impact_score || 0,
          priority: (payload.new?.impact_score > 20 ? 'breaking' : 'background') as 'breaking' | 'background',
          timestamp: payload.new?.created_at || new Date().toISOString()
        };
        break;
    }

    if (event) {
      onEvent(event);
    }
  }, [onEvent]);

  useEffect(() => {
    // Create a single channel for all database changes
    channelRef.current = supabase
      .channel('broadcast-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions'
        },
        handleDatabaseEvent
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_odds'
        },
        handleDatabaseEvent
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams'
        },
        handleDatabaseEvent
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_activities'
        },
        handleDatabaseEvent
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [handleDatabaseEvent]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
}
