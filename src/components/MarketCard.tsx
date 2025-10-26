import { useState, useEffect, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Trophy, DollarSign } from "lucide-react";
import { BettingModal } from "./BettingModal";
import { supabase } from "@/integrations/supabase/client";

interface TeamOdds {
  team_id: string;
  team_name: string;
  team_logo: string;
  current_odds: number;
  volume: number;
  trend?: number;
}

interface MarketCardProps {
  marketId: string;
  category: string;
  sponsor?: {
    name: string;
    logo_url: string;
  };
  prizeAmount: number;
  totalPool: number;
  status: string;
}

export const MarketCard = memo(({
  marketId,
  category,
  sponsor,
  prizeAmount,
  totalPool,
  status,
}: MarketCardProps) => {
  const [teamOdds, setTeamOdds] = useState<TeamOdds[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamOdds | null>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);

  useEffect(() => {
    fetchTeamOdds();

    // Subscribe to real-time odds updates
    const channel = supabase
      .channel(`market-odds-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_odds',
          filter: `market_id=eq.${marketId}`,
        },
        () => {
          fetchTeamOdds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  const fetchTeamOdds = async () => {
    const { data, error } = await supabase
      .from('market_odds')
      .select(`
        team_id,
        current_odds,
        volume,
        teams (
          name,
          logo_url
        )
      `)
      .eq('market_id', marketId)
      .order('current_odds', { ascending: false })
      .limit(5);

    if (data && !error) {
      const formattedOdds: TeamOdds[] = data.map((item: any) => ({
        team_id: item.team_id,
        team_name: item.teams.name,
        team_logo: item.teams.logo_url,
        current_odds: parseFloat(item.current_odds),
        volume: item.volume,
      }));
      setTeamOdds(formattedOdds);
    }
  };

  const handlePlaceBet = useCallback((team: TeamOdds) => {
    setSelectedTeam(team);
    setShowBettingModal(true);
  }, []);

  return (
    <>
      <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {sponsor && (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="w-6 h-6 rounded object-contain"
                />
              )}
              <h3 className="text-lg font-bold">{category}</h3>
            </div>
            {sponsor && (
              <p className="text-sm text-muted-foreground">
                Sponsored by {sponsor.name}
              </p>
            )}
          </div>
          <Badge
            variant={status === 'open' ? 'default' : 'secondary'}
            className="ml-2"
          >
            {status === 'open' ? '🟢 LIVE' : status.toUpperCase()}
          </Badge>
        </div>

        {/* Prize & Pool Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
              <p className="text-lg font-bold">${prizeAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Bets</p>
              <p className="text-lg font-bold">{totalPool.toLocaleString()} HC</p>
            </div>
          </div>
        </div>

        {/* Top Teams */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Top Contenders</h4>
          {teamOdds.slice(0, 5).map((team, index) => (
            <div
              key={team.team_id}
              className="flex items-center gap-3 p-3 bg-background/30 rounded-lg hover:bg-background/50 transition-colors"
            >
              <span className="text-xs font-bold text-muted-foreground w-6">
                #{index + 1}
              </span>
              <img
                src={team.team_logo}
                alt={team.team_name}
                className="w-8 h-8 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{team.team_name}</p>
                <Progress value={team.current_odds} className="h-1 mt-1" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">
                    {team.current_odds.toFixed(1)}%
                  </span>
                  {team.trend && team.trend > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : team.trend && team.trend < 0 ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {team.volume} HC
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handlePlaceBet(team)}
                disabled={status !== 'open'}
                className="ml-2"
              >
                Bet
              </Button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {teamOdds.length > 5 && (
          <Button variant="outline" className="w-full mt-4">
            View All {teamOdds.length} Teams
          </Button>
        )}
      </Card>

      {selectedTeam && (
        <BettingModal
          open={showBettingModal}
          onOpenChange={setShowBettingModal}
          marketId={marketId}
          marketCategory={category}
          team={selectedTeam}
          onBetPlaced={fetchTeamOdds}
        />
      )}
    </>
  );
});
