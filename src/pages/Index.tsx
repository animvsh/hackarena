import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { UserWallet } from "@/components/UserWallet";
import { TrendingTeams } from "@/components/TrendingTeams";
import { RevenueDrivers } from "@/components/RevenueDrivers";
import { LiveMarketChart } from "@/components/LiveMarketChart";
import { LiveCommentaryTicker } from "@/components/LiveCommentaryTicker";
import { BroadcastVideoPlayer } from "@/components/broadcast/BroadcastVideoPlayer";
import { Users, TrendingUp, Zap, Trophy, Radio, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activeTeams: number;
  commitsPerHour: number;
  marketsOpen: number;
  predictionsMade: number;
  commentaryEvents: number;
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeTeams: 0,
    commitsPerHour: 0,
    marketsOpen: 0,
    predictionsMade: 0,
    commentaryEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();

    // Subscribe to changes
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams'
      }, fetchDashboardStats)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'predictions'
      }, fetchDashboardStats)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prediction_markets'
      }, fetchDashboardStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);

    // Active teams
    const { count: activeTeams } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Calculate commits/hour from progress_updates
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCommits } = await supabase
      .from('progress_updates')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'commit')
      .gte('created_at', oneHourAgo);

    // Markets open
    const { count: marketsOpen } = await supabase
      .from('prediction_markets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Predictions made
    const { count: predictionsMade } = await supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true });

    // Commentary events
    const { count: commentaryEvents } = await supabase
      .from('commentary_feed')
      .select('*', { count: 'exact', head: true });

    setStats({
      activeTeams: activeTeams || 0,
      commitsPerHour: recentCommits || 0,
      marketsOpen: marketsOpen || 0,
      predictionsMade: predictionsMade || 0,
      commentaryEvents: commentaryEvents || 0,
    });

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Live Broadcast - Main Feature */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Radio className="w-6 h-6 text-destructive animate-pulse" />
            Live Broadcast
          </h2>
          <BroadcastVideoPlayer />
        </div>

        {/* Live Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Hackathon Metrics</h2>
            <Select defaultValue="current">
              <SelectTrigger className="w-[200px] bg-secondary border-border">
                <SelectValue placeholder="Hackathon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Hackathon</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard
                  icon={Users}
                  label="Active Teams"
                  value={stats.activeTeams.toString()}
                  trend={15}
                  iconColor="neon-purple"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Commits / Hour"
                  value={stats.commitsPerHour.toString()}
                  trend={8}
                  iconColor="neon-blue"
                />
                <StatCard
                  icon={Zap}
                  label="Markets Open"
                  value={stats.marketsOpen.toString()}
                  iconColor="neon-pink"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={Trophy}
                  label="Featured Track"
                  value=""
                  iconColor="neon-blue"
                  highlight
                  highlightContent={
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-info-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-info-foreground mb-1">Best AI Application</p>
                        <p className="text-xs text-info-foreground/70">{stats.activeTeams} Teams • $10K Prize</p>
                      </div>
                    </div>
                  }
                />
                <StatCard
                  icon={BarChart3}
                  label="Predictions Made"
                  value={stats.predictionsMade.toLocaleString()}
                  trend={23}
                  iconColor="neon-pink"
                />
                <StatCard
                  icon={Radio}
                  label="Commentary Events"
                  value={stats.commentaryEvents.toString()}
                  trend={12}
                  iconColor="neon-blue"
                />
              </div>
            </>
          )}
        </div>

        {/* Charts and Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <LiveMarketChart />

          <div className="space-y-6">
            <UserWallet />
            <TrendingTeams />
            <RevenueDrivers />
          </div>
        </div>

        {/* Live Commentary Ticker */}
        <LiveCommentaryTicker />
      </main>
    </div>
  );
};

export default Index;
