import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FillerContent } from '@/types/broadcastEvent';

interface TeamAnalysis {
  team_name: string;
  momentum_score: number;
  current_progress: number;
  team_size: number;
  recent_trend: 'rising' | 'falling' | 'steady';
}

export function useTeamAnalysis() {
  const [teams, setTeams] = useState<TeamAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('name, momentum_score, current_progress, team_size')
        .limit(20);

      if (data) {
        const analyzed = data.map(t => ({
          team_name: t.name,
          momentum_score: t.momentum_score || 50,
          current_progress: t.current_progress || 0,
          team_size: t.team_size || 4,
          recent_trend: (t.momentum_score || 50) > 60 ? 'rising' as const : 
                       (t.momentum_score || 50) < 40 ? 'falling' as const : 
                       'steady' as const
        }));
        setTeams(analyzed);
      }
    };

    fetchTeams();
  }, []);

  const generateAnalysis = useCallback((): FillerContent | null => {
    if (teams.length === 0) return null;

    const team = teams[currentIndex];
    setCurrentIndex(prev => (prev + 1) % teams.length);

    const analysisTemplates = [
      `Looking at ${team.team_name}'s strategy - they're showing ${team.recent_trend} momentum at ${team.momentum_score.toFixed(0)}%. ${team.recent_trend === 'rising' ? 'Watch them closely!' : team.recent_trend === 'falling' ? 'Can they turn it around?' : 'Steady and calculated.'}`,
      
      `${team.team_name} analysis: Progress at ${team.current_progress}, team of ${team.team_size}. ${team.momentum_score > 70 ? 'They\'re on FIRE!' : team.momentum_score > 50 ? 'Solid performance so far.' : 'They need a breakthrough move.'}`,
      
      `Breaking down ${team.team_name}'s approach: ${team.recent_trend === 'rising' ? 'Aggressive push forward!' : team.recent_trend === 'falling' ? 'Playing it safe for now.' : 'Calculated and methodical.'} Momentum: ${team.momentum_score.toFixed(0)}%`,
      
      `${team.team_name} showing ${team.recent_trend} trends. With ${team.team_size} members and ${team.current_progress} progress, ${team.momentum_score > 60 ? 'they\'re a team to watch!' : 'they\'re pacing themselves.'}`,
      
      `Our analysts are tracking ${team.team_name} closely. Current momentum: ${team.momentum_score.toFixed(0)}%. ${team.recent_trend === 'rising' ? 'Could be the dark horse!' : team.recent_trend === 'falling' ? 'Looking for their next move.' : 'Steady execution pays off.'}`
    ];

    const randomTemplate = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];

    return {
      id: `analysis-${team.team_name}-${Date.now()}`,
      type: 'team_analysis',
      text: randomTemplate,
      teamName: team.team_name,
      priority: 'background',
      timestamp: new Date().toISOString()
    };
  }, [teams, currentIndex]);

  return { generateAnalysis };
}
