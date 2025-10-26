import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LiveMarketChartProps {
  hackathonId?: string;
}

export const LiveMarketChart = ({ hackathonId }: LiveMarketChartProps) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [oddsHistory, setOddsHistory] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [stats, setStats] = useState({ totalVolume: 0, activeMarkets: 0, predictions: 0 });

  useEffect(() => {
    fetchMarketData();

    // Subscribe to real-time odds updates
    const channel = supabase
      .channel('market-odds-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_odds'
        },
        () => {
          fetchMarketData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTrack, hackathonId]);

  const fetchMarketData = async () => {
    let query = supabase
      .from('teams')
      .select('id, name')
      .limit(6);

    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    }

    const { data: teamsData } = await query;

    if (teamsData) {
      setTeams(teamsData);

      // Get actual odds data from market_odds
      const { data: oddsData } = await supabase
        .from('market_odds')
        .select(`
          team_id,
          current_odds,
          teams!inner (
            name,
            hackathon_id
          )
        `)
        .limit(6);

      if (oddsData && oddsData.length > 0) {
        // Use real odds data
        const filteredOdds = hackathonId
          ? oddsData.filter((item: any) => item.teams?.hackathon_id === hackathonId)
          : oddsData;

        const chartData = filteredOdds.map((item: any) => ({
          name: item.teams?.name || 'Unknown',
          odds: item.current_odds || 0,
        }));

        setOddsHistory(chartData);
      } else {
        // Fallback to mock data if no odds available
        const chartData = teamsData.map((team, index) => ({
          name: team.name,
          odds: 50 + (index * 5),
        }));

        setOddsHistory(chartData);
      }
    }

    // Fetch stats - filter by hackathon
    let marketsQuery = supabase
      .from('prediction_markets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open');

    if (hackathonId) {
      marketsQuery = marketsQuery.eq('hackathon_id', hackathonId);
    }

    const { count: activeMarkets } = await marketsQuery;

    // Get volume for this hackathon's markets
    let oddsVolumeQuery = supabase
      .from('market_odds')
      .select(`
        volume,
        prediction_markets!inner (
          hackathon_id
        )
      `);

    if (hackathonId) {
      oddsVolumeQuery = oddsVolumeQuery.eq('prediction_markets.hackathon_id', hackathonId);
    }

    const { data: volumeData } = await oddsVolumeQuery;
    const totalVolume = volumeData?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;

    // Get predictions for this hackathon
    let predictionsQuery = supabase
      .from('predictions')
      .select(`
        id,
        prediction_markets!inner (
          hackathon_id
        )
      `, { count: 'exact', head: true });

    if (hackathonId) {
      predictionsQuery = predictionsQuery.eq('prediction_markets.hackathon_id', hackathonId);
    }

    const { count: predictions } = await predictionsQuery;

    setStats({
      totalVolume,
      activeMarkets: activeMarkets || 0,
      predictions: predictions || 0,
    });
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">🎯 Live Prediction Markets</h3>
        <Select value={selectedTrack} onValueChange={setSelectedTrack}>
          <SelectTrigger className="w-[200px] bg-secondary border-border">
            <SelectValue placeholder="Select track" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            <SelectItem value="ai">Claude AI Track</SelectItem>
            <SelectItem value="fintech">Visa FinTech</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={oddsHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Line 
            type="monotone"
            dataKey="odds"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))' }}
            name="Win Probability %"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Volume</p>
          <p className="text-lg font-bold">{stats.totalVolume.toLocaleString()} HC</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Active Markets</p>
          <p className="text-lg font-bold">{stats.activeMarkets}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Predictions</p>
          <p className="text-lg font-bold">{stats.predictions.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
