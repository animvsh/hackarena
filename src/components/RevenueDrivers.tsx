import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Code, BarChart3, Users } from "lucide-react";

interface Metrics {
  totalAPICalls: number;
  totalPredictions: number;
  activeTeams: number;
}

interface RevenueDriversProps {
  hackathonId?: string;
}

export const RevenueDrivers = ({ hackathonId }: RevenueDriversProps) => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalAPICalls: 0,
    totalPredictions: 0,
    activeTeams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('metrics-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_usage'
      }, fetchMetrics)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'predictions'
      }, fetchMetrics)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams'
      }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId]);

  const fetchMetrics = async () => {
    setLoading(true);

    // Get total API calls (filtered by team's hackathon if available)
    let apiQuery = supabase
      .from('api_usage')
      .select(`
        call_count,
        teams!inner (
          hackathon_id
        )
      `);

    if (hackathonId) {
      apiQuery = apiQuery.eq('teams.hackathon_id', hackathonId);
    }

    const { data: apiData } = await apiQuery;
    const totalAPICalls = apiData?.reduce((sum, item) => sum + (item.call_count || 0), 0) || 0;

    // Get total predictions (filter by hackathon via market)
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

    const { count: totalPredictions } = await predictionsQuery;

    // Get active teams count (filter by hackathon)
    let teamsQuery = supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (hackathonId) {
      teamsQuery = teamsQuery.eq('hackathon_id', hackathonId);
    }

    const { count: activeTeams } = await teamsQuery;

    setMetrics({
      totalAPICalls,
      totalPredictions: totalPredictions || 0,
      activeTeams: activeTeams || 0,
    });

    setLoading(false);
  };

  const drivers = [
    {
      icon: Code,
      label: "API Calls Made",
      value: loading ? "Loading..." : `${metrics.totalAPICalls.toLocaleString()} calls`,
      color: "neon-blue"
    },
    {
      icon: BarChart3,
      label: "Predictions Placed",
      value: loading ? "Loading..." : `${metrics.totalPredictions.toLocaleString()} bets`,
      color: "neon-purple"
    },
    {
      icon: Users,
      label: "Active Teams",
      value: loading ? "Loading..." : `${metrics.activeTeams} teams`,
      color: "neon-pink"
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-bold mb-6">Hackathon Metrics</h3>
      <div className="space-y-4">
        {drivers.map((driver, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${driver.color}/20 flex items-center justify-center flex-shrink-0`}>
              <driver.icon className={`w-5 h-5 text-${driver.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{driver.label}</p>
              <p className="text-xs text-muted-foreground truncate">{driver.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
