import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FillerContent } from '@/types/broadcastEvent';

interface HistoricalStat {
  type: 'bet' | 'odds' | 'progress' | 'general';
  fact: string;
  team_name?: string;
}

export function useHistoricalStats() {
  const [stats, setStats] = useState<HistoricalStat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch interesting statistics from the database
      const facts: HistoricalStat[] = [];

      // Get total bets placed
      const { data: predictions } = await supabase
        .from('predictions')
        .select('amount, created_at')
        .order('amount', { ascending: false })
        .limit(1);

      if (predictions && predictions.length > 0) {
        facts.push({
          type: 'bet',
          fact: `Record bet: ${predictions[0].amount} coins! Can anyone top that?`
        });
      }

      // Get team with highest momentum
      const { data: topTeam } = await supabase
        .from('teams')
        .select('name, momentum_score')
        .order('momentum_score', { ascending: false })
        .limit(1)
        .single();

      if (topTeam) {
        facts.push({
          type: 'general',
          team_name: topTeam.name,
          fact: `${topTeam.name} currently leads in momentum at ${topTeam.momentum_score?.toFixed(0)}%!`
        });
      }

      // Get team with most progress
      const { data: progressLeader } = await supabase
        .from('teams')
        .select('name, current_progress')
        .order('current_progress', { ascending: false })
        .limit(1)
        .single();

      if (progressLeader) {
        facts.push({
          type: 'progress',
          team_name: progressLeader.name,
          fact: `${progressLeader.name} leading with ${progressLeader.current_progress} progress points!`
        });
      }

      // Generic interesting facts
      facts.push(
        { type: 'general', fact: 'Teams strategizing their next moves as the competition intensifies!' },
        { type: 'general', fact: 'Every decision counts in this high-stakes coding showdown!' },
        { type: 'general', fact: 'Momentum can shift in an instant - stay alert!' },
        { type: 'general', fact: 'The best teams balance speed with precision!' }
      );

      setStats(facts);
    };

    fetchStats();
    
    // Refresh stats periodically
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const generateHistoricalStat = useCallback((): FillerContent | null => {
    if (stats.length === 0) return null;

    const stat = stats[currentIndex];
    setCurrentIndex(prev => (prev + 1) % stats.length);

    const prefixes = [
      'Did you know? ',
      'Fun fact: ',
      'Here\'s an interesting stat: ',
      'Breaking down the numbers: ',
      'Looking at the data: ',
      ''
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return {
      id: `stat-${Date.now()}`,
      type: 'historical_stat',
      text: `${prefix}${stat.fact}`,
      teamName: stat.team_name,
      priority: 'background',
      timestamp: new Date().toISOString()
    };
  }, [stats, currentIndex]);

  return { generateHistoricalStat };
}
