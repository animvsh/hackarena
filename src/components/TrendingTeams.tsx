import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

interface TeamWithMetrics {
  id: string;
  name: string;
  logo_url: string;
  team_metrics: Array<{
    velocity_score: number;
  }>;
  market_odds: Array<{
    current_odds: number;
  }>;
}

export const TrendingTeams = () => {
  const [teams, setTeams] = useState<TeamWithMetrics[]>([]);

  useEffect(() => {
    fetchTrending();

    const channel = supabase
      .channel('team-metrics-updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'team_metrics' 
      }, fetchTrending)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrending = async () => {
    const { data } = await supabase
      .from('teams')
      .select('id, name, logo_url, team_metrics(velocity_score), market_odds(current_odds)')
      .limit(5);
    
    if (data) {
      setTeams(data as TeamWithMetrics[]);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Trending Teams</h3>
      </div>
      <div className="space-y-4">
        {teams.length > 0 ? teams.map((team, index) => (
          <div key={team.id} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              {team.logo_url ? (
                <img src={team.logo_url} alt={team.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-primary font-bold">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{team.name}</p>
              <p className="text-xs text-muted-foreground">
                {team.team_metrics?.[0]?.velocity_score?.toFixed(1) || '0'} commits/hr
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-success text-success-foreground flex-shrink-0">
              {((team.market_odds?.[0]?.current_odds || 0) * 100).toFixed(0)}%
            </span>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No active teams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Teams will appear when hackathon starts</p>
          </div>
        )}
      </div>
    </div>
  );
};
