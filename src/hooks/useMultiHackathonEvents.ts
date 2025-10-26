import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HackathonEvent {
  hackathonId: string;
  hackathonName: string;
  type: 'bet_placed' | 'odds_change' | 'team_update' | 'milestone' | 'breaking_news' | 'market_opened';
  teamName?: string;
  metricType: string;
  currentValue: number;
  change: number;
  priority: 'breaking' | 'high' | 'normal' | 'background';
  timestamp: string;
  rawData?: any;
}

interface HackathonScore {
  hackathonId: string;
  hackathonName: string;
  score: number;
  lastEventTime: number;
  recentEvents: HackathonEvent[];
}

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
}

// Score weights based on event priority
const SCORE_WEIGHTS = {
  breaking: 100,
  high: 50,
  normal: 10,
  background: 5,
};

// Decay factor: score decreases by 50% every 2 minutes
const DECAY_HALF_LIFE_MS = 2 * 60 * 1000;

export function useMultiHackathonEvents() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(null);
  const [latestEvent, setLatestEvent] = useState<HackathonEvent | null>(null);
  const hackathonScoresRef = useRef<Map<string, HackathonScore>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const eventProcessedRef = useRef<Set<string>>(new Set());
  const teamCacheRef = useRef<Map<string, string>>(new Map()); // teamId -> hackathonId
  const marketCacheRef = useRef<Map<string, string>>(new Map()); // marketId -> hackathonId

  // Calculate time-decayed score
  const calculateDecayedScore = useCallback((score: number, lastEventTime: number): number => {
    const now = Date.now();
    const timeDiff = now - lastEventTime;
    const halfLives = timeDiff / DECAY_HALF_LIFE_MS;
    return score * Math.pow(0.5, halfLives);
  }, []);

  // Update hackathon score
  const updateHackathonScore = useCallback((event: HackathonEvent) => {
    const scores = hackathonScoresRef.current;
    const existing = scores.get(event.hackathonId);
    const now = Date.now();

    // Calculate new score
    const baseScore = SCORE_WEIGHTS[event.priority];

    if (existing) {
      // Apply decay to existing score before adding new score
      const decayedScore = calculateDecayedScore(existing.score, existing.lastEventTime);
      const newScore = decayedScore + baseScore;

      scores.set(event.hackathonId, {
        hackathonId: event.hackathonId,
        hackathonName: event.hackathonName,
        score: newScore,
        lastEventTime: now,
        recentEvents: [...existing.recentEvents.slice(-9), event], // Keep last 10 events
      });
    } else {
      scores.set(event.hackathonId, {
        hackathonId: event.hackathonId,
        hackathonName: event.hackathonName,
        score: baseScore,
        lastEventTime: now,
        recentEvents: [event],
      });
    }

    // Find the hackathon with highest decayed score
    let maxScore = 0;
    let hottestHackathonId: string | null = null;

    scores.forEach((scoreData, hackathonId) => {
      const decayedScore = calculateDecayedScore(scoreData.score, scoreData.lastEventTime);
      if (decayedScore > maxScore) {
        maxScore = decayedScore;
        hottestHackathonId = hackathonId;
      }
    });

    // Update current hackathon if changed
    if (hottestHackathonId && hottestHackathonId !== currentHackathon?.id) {
      const hottest = hackathons.find(h => h.id === hottestHackathonId);
      if (hottest) {
        setCurrentHackathon(hottest);
      }
    }

    setLatestEvent(event);
  }, [hackathons, currentHackathon, calculateDecayedScore]);

  // Fetch hackathon ID for a team
  const getTeamHackathonId = useCallback(async (teamId: string): Promise<{ hackathonId: string; teamName: string } | null> => {
    // Check cache first
    if (teamCacheRef.current.has(teamId)) {
      const { data } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();

      return {
        hackathonId: teamCacheRef.current.get(teamId)!,
        teamName: data?.name || 'Unknown Team'
      };
    }

    // Fetch from database
    const { data } = await supabase
      .from('teams')
      .select('hackathon_id, name')
      .eq('id', teamId)
      .single();

    if (data?.hackathon_id) {
      teamCacheRef.current.set(teamId, data.hackathon_id);
      return {
        hackathonId: data.hackathon_id,
        teamName: data.name || 'Unknown Team'
      };
    }

    return null;
  }, []);

  // Fetch hackathon ID for a market
  const getMarketHackathonId = useCallback(async (marketId: string): Promise<string | null> => {
    // Check cache first
    if (marketCacheRef.current.has(marketId)) {
      return marketCacheRef.current.get(marketId)!;
    }

    // Fetch from database
    const { data } = await supabase
      .from('prediction_markets')
      .select('hackathon_id')
      .eq('id', marketId)
      .single();

    if (data?.hackathon_id) {
      marketCacheRef.current.set(marketId, data.hackathon_id);
      return data.hackathon_id;
    }

    return null;
  }, []);

  // Handle database events
  const handleDatabaseEvent = useCallback(async (payload: any) => {
    // Prevent duplicate processing
    const eventId = `${payload.table}-${payload.new?.id}-${payload.eventType}-${Date.now()}`;
    if (eventProcessedRef.current.has(eventId)) return;
    eventProcessedRef.current.add(eventId);

    // Clean up old event IDs (keep last 100)
    if (eventProcessedRef.current.size > 100) {
      const entries = Array.from(eventProcessedRef.current);
      eventProcessedRef.current = new Set(entries.slice(-50));
    }

    let event: HackathonEvent | null = null;

    // Process different table events
    switch (payload.table) {
      case 'predictions': {
        const marketId = payload.new?.market_id;
        if (!marketId) return;

        const hackathonId = await getMarketHackathonId(marketId);
        if (!hackathonId) return;

        const hackathon = hackathons.find(h => h.id === hackathonId);
        if (!hackathon) return;

        const amount = payload.new?.amount || 0;
        event = {
          hackathonId,
          hackathonName: hackathon.name,
          type: 'bet_placed',
          teamName: payload.new?.team_name || 'Unknown Team',
          metricType: 'Bet Placed',
          currentValue: amount,
          change: amount,
          priority: amount > 500 ? 'breaking' : amount > 200 ? 'high' : 'normal',
          timestamp: payload.new?.created_at || new Date().toISOString(),
          rawData: payload.new,
        };
        break;
      }

      case 'teams': {
        const teamId = payload.new?.id;
        const hackathonId = payload.new?.hackathon_id;
        if (!hackathonId) return;

        const hackathon = hackathons.find(h => h.id === hackathonId);
        if (!hackathon) return;

        const momentumChange = payload.new?.momentum_score - (payload.old?.momentum_score || payload.new?.momentum_score || 0);
        if (Math.abs(momentumChange) > 3) {
          event = {
            hackathonId,
            hackathonName: hackathon.name,
            type: 'team_update',
            teamName: payload.new?.name || 'Unknown Team',
            metricType: 'Momentum',
            currentValue: payload.new?.momentum_score || 0,
            change: momentumChange,
            priority: Math.abs(momentumChange) > 15 ? 'breaking' : Math.abs(momentumChange) > 8 ? 'high' : 'normal',
            timestamp: payload.new?.updated_at || new Date().toISOString(),
            rawData: payload.new,
          };
        }
        break;
      }

      case 'prediction_markets': {
        const hackathonId = payload.new?.hackathon_id;
        if (!hackathonId) return;

        const hackathon = hackathons.find(h => h.id === hackathonId);
        if (!hackathon) return;

        // New market opened
        if (payload.eventType === 'INSERT') {
          event = {
            hackathonId,
            hackathonName: hackathon.name,
            type: 'market_opened',
            metricType: 'New Market',
            currentValue: 0,
            change: 0,
            priority: 'high',
            timestamp: payload.new?.created_at || new Date().toISOString(),
            rawData: payload.new,
          };
        }
        break;
      }

      case 'commentary_feed': {
        const hackathonId = payload.new?.hackathon_id;
        if (!hackathonId) return;

        const hackathon = hackathons.find(h => h.id === hackathonId);
        if (!hackathon) return;

        const sentiment = payload.new?.sentiment_score || 0;
        event = {
          hackathonId,
          hackathonName: hackathon.name,
          type: 'breaking_news',
          metricType: 'Commentary',
          currentValue: sentiment,
          change: sentiment,
          priority: Math.abs(sentiment) > 0.7 ? 'breaking' : 'normal',
          timestamp: payload.new?.created_at || new Date().toISOString(),
          rawData: payload.new,
        };
        break;
      }
    }

    if (event) {
      updateHackathonScore(event);
    }
  }, [hackathons, getMarketHackathonId, updateHackathonScore]);

  // Fetch active hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      const { data } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setHackathons(data);

        // Initialize with first hackathon if none selected
        if (!currentHackathon) {
          setCurrentHackathon(data[0]);

          // Initialize scores
          data.forEach(h => {
            hackathonScoresRef.current.set(h.id, {
              hackathonId: h.id,
              hackathonName: h.name,
              score: 0,
              lastEventTime: Date.now(),
              recentEvents: [],
            });
          });
        }
      }
    };

    fetchHackathons();
  }, [currentHackathon]);

  // Subscribe to database events
  useEffect(() => {
    if (hackathons.length === 0) return;

    channelRef.current = supabase
      .channel('multi-hackathon-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'predictions'
      }, handleDatabaseEvent)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'teams'
      }, handleDatabaseEvent)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'prediction_markets'
      }, handleDatabaseEvent)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'commentary_feed'
      }, handleDatabaseEvent)
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [hackathons, handleDatabaseEvent]);

  // Get current scores for all hackathons
  const getHackathonScores = useCallback(() => {
    const scores: Array<{ hackathonId: string; hackathonName: string; score: number }> = [];

    hackathonScoresRef.current.forEach((scoreData) => {
      const decayedScore = calculateDecayedScore(scoreData.score, scoreData.lastEventTime);
      scores.push({
        hackathonId: scoreData.hackathonId,
        hackathonName: scoreData.hackathonName,
        score: decayedScore,
      });
    });

    return scores.sort((a, b) => b.score - a.score);
  }, [calculateDecayedScore]);

  return {
    hackathons,
    currentHackathon,
    latestEvent,
    getHackathonScores,
    isConnected: channelRef.current?.state === 'joined',
  };
}
