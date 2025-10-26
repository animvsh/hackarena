import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  momentum_score: number;
  current_progress: number;
}

interface TrendingTeamsProps {
  hackathonId?: string;
}

export const TrendingTeams = ({ hackathonId }: TrendingTeamsProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();

    const channel = supabase
      .channel('teams-momentum-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'teams'
      }, fetchTrending)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId]);

  const fetchTrending = async () => {
    setLoading(true);
    let query = supabase
      .from('teams')
      .select('id, name, logo_url, momentum_score, current_progress')
      .order('momentum_score', { ascending: false })
      .limit(5);
    
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    }
    
    const { data } = await query;

    if (data) {
      setTeams(data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Trending Teams</h3>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : teams.length > 0 ? (
          teams.map((team, index) => (
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
                  {team.momentum_score.toFixed(1)} momentum
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-success text-success-foreground flex-shrink-0">
                {team.current_progress}%
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No active teams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Teams will appear when hackathon starts</p>
          </div>
        )}
      </div>
    </div>
  );
};
