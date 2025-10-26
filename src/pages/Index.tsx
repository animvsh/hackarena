import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { UserWallet } from "@/components/UserWallet";
import { TrendingTeams } from "@/components/TrendingTeams";
import { RevenueDrivers } from "@/components/RevenueDrivers";
import { LiveMarketChart } from "@/components/LiveMarketChart";
import { LiveCommentaryTicker } from "@/components/LiveCommentaryTicker";
import { BroadcastCarousel } from "@/components/broadcast/BroadcastCarousel";
import { HackathonInfoCard } from "@/components/HackathonInfoCard";
import { useActiveBroadcasts } from "@/hooks/useActiveBroadcasts";
import { SimulationController } from "@/components/SimulationController";
import { LinkedInVerificationModal } from "@/components/LinkedInVerificationModal";
import { useAuth } from "@/contexts/AuthContext";
import { Users, TrendingUp, Zap, Trophy, Radio, BarChart3 } from "lucide-react";
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
  const { user } = useAuth();
  const { hackathons, selectedHackathon, selectHackathon, loading: hackathonsLoading } = useActiveBroadcasts();
  const [stats, setStats] = useState<DashboardStats>({
    activeTeams: 0,
    commitsPerHour: 0,
    marketsOpen: 0,
    predictionsMade: 0,
    commentaryEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedinVerified, setLinkedinVerified] = useState<boolean | null>(null);

  // Check LinkedIn verification status on mount
  useEffect(() => {
    const checkLinkedInVerification = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('linkedin_verified')
        .eq('id', user.id)
        .single();

      const isVerified = data?.linkedin_verified || false;
      setLinkedinVerified(isVerified);

      // Show modal if not verified and haven't seen it before (using localStorage)
      const hasSeenModal = localStorage.getItem('linkedinVerificationPromptShown');
      if (!isVerified && !hasSeenModal) {
        // Delay showing the modal by 2 seconds to not overwhelm the user immediately
        setTimeout(() => {
          setShowLinkedInModal(true);
        }, 2000);
      }
    };

    checkLinkedInVerification();
  }, [user]);

  // Mark modal as seen when user interacts with it
  const handleLinkedInModalClose = (open: boolean) => {
    if (!open && showLinkedInModal) {
      // User is closing the modal, mark it as seen
      localStorage.setItem('linkedinVerificationPromptShown', 'true');
    }
    setShowLinkedInModal(open);
  };

  useEffect(() => {
    if (selectedHackathon) {
      fetchDashboardStats(selectedHackathon.id);
    }

    // Subscribe to changes
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams'
      }, () => selectedHackathon && fetchDashboardStats(selectedHackathon.id))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'predictions'
      }, () => selectedHackathon && fetchDashboardStats(selectedHackathon.id))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prediction_markets'
      }, () => selectedHackathon && fetchDashboardStats(selectedHackathon.id))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedHackathon]);

  const fetchDashboardStats = async (hackathonId: string) => {
    setLoading(true);

    // Active teams for this hackathon
    const { count: activeTeams } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('hackathon_id', hackathonId);

    // Calculate commits/hour from progress_updates for teams in this hackathon
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: hackathonTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId);
    
    const teamIds = hackathonTeams?.map(t => t.id) || [];
    
    const { count: recentCommits } = await supabase
      .from('progress_updates')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'commit')
      .in('team_id', teamIds.length > 0 ? teamIds : [''])
      .gte('created_at', oneHourAgo);

    // Markets open for this hackathon
    const { count: marketsOpen } = await supabase
      .from('prediction_markets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .eq('hackathon_id', hackathonId);

    // Predictions made on this hackathon's markets
    const { data: hackathonMarkets } = await supabase
      .from('prediction_markets')
      .select('id')
      .eq('hackathon_id', hackathonId);
    
    const marketIds = hackathonMarkets?.map(m => m.id) || [];

    const { count: predictionsMade } = await supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .in('market_id', marketIds.length > 0 ? marketIds : ['']);

    // Commentary events for this hackathon
    const { count: commentaryEvents } = await supabase
      .from('commentary_feed')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId);

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

        {/* Live Broadcast Carousel */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-yellow via-neon-blue to-neon-purple bg-clip-text text-transparent">
              Live Hackathon Broadcasts
            </h2>
            <p className="text-muted-foreground text-sm">
              Real-time AI commentary from active hackathons
            </p>
          </div>
          
          {hackathonsLoading ? (
            <Skeleton className="h-[500px] rounded-2xl" />
          ) : (
            <BroadcastCarousel 
              hackathons={hackathons} 
              onHackathonChange={selectHackathon}
            />
          )}
        </div>

        {/* Hackathon Info Card */}
        {selectedHackathon && !hackathonsLoading && (
          <div className="mb-8">
            <HackathonInfoCard hackathon={selectedHackathon} />
          </div>
        )}

        {/* Live Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Metrics - {selectedHackathon?.name || 'Hackathon'}</h2>
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
        {selectedHackathon && (
          <div className="grid grid-cols-3 gap-6 mb-6">
            <LiveMarketChart hackathonId={selectedHackathon.id} />

            <div className="space-y-6">
              <UserWallet />
              <TrendingTeams hackathonId={selectedHackathon.id} />
              <RevenueDrivers />
            </div>
          </div>
        )}

        {/* Live Commentary Ticker */}
        {selectedHackathon && <LiveCommentaryTicker hackathonId={selectedHackathon.id} />}
      </main>

      {/* Simulation Controller (Dev Mode Only) */}
      {import.meta.env.DEV && selectedHackathon && (
        <SimulationController />
      )}

      {/* LinkedIn Verification Modal */}
      <LinkedInVerificationModal
        open={showLinkedInModal}
        onOpenChange={handleLinkedInModalClose}
      />
    </div>
  );
};

export default Index;
