import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const LiveMarketChart = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [oddsHistory, setOddsHistory] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");

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
  }, [selectedTrack]);

  const fetchMarketData = async () => {
    const { data: teamsData } = await supabase
      .from('teams')
      .select('id, name, market_odds(current_odds, updated_at)')
      .limit(5);

    if (teamsData) {
      setTeams(teamsData);
      
      // Transform data for chart
      const chartData = teamsData.map(team => ({
        name: team.name,
        odds: team.market_odds?.[0]?.current_odds * 100 || 0,
      }));
      
      setOddsHistory(chartData);
    }
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
          <p className="text-lg font-bold">124.5K HC</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Active Markets</p>
          <p className="text-lg font-bold">8</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Predictions</p>
          <p className="text-lg font-bold">1,247</p>
        </div>
      </div>
    </div>
  );
};
