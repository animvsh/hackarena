import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2 } from 'lucide-react';
import { BetStatusBanner } from '@/components/bet-detail/BetStatusBanner';
import { OddsChart } from '@/components/bet-detail/OddsChart';
import { CompetitorTable } from '@/components/bet-detail/CompetitorTable';
import { ActivityFeedItem } from '@/components/bet-detail/ActivityFeedItem';
import { ROICalculator } from '@/components/bet-detail/ROICalculator';
import { BetShareCard } from '@/components/bet-detail/BetShareCard';
import { MarketActivityHeatmap } from '@/components/bet-detail/MarketActivityHeatmap';
import { formatDistanceToNow, format } from 'date-fns';

interface Prediction {
  id: string;
  amount: number;
  odds_at_bet: number;
  status: string;
  payout: number;
  created_at: string;
  team_id: string;
  market_id: string;
  teams: {
    id: string;
    name: string;
    logo_url: string;
    momentum_score: number;
    current_progress: number;
    category: string[];
  };
  prediction_markets: {
    id: string;
    category: string;
    status: string;
    total_pool: number;
    prize_amount: number;
    start_time: string;
    end_time: string;
  };
}

export default function BetDetail() {
  const { betId } = useParams<{ betId: string }>();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [oddsHistory, setOddsHistory] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!betId) return;

    const fetchBetData = async () => {
      try {
        // Fetch prediction data
        const { data: predictionData, error: predictionError } = await supabase
          .from('predictions')
          .select(`
            *,
            teams (
              id,
              name,
              logo_url,
              momentum_score,
              current_progress,
              category
            ),
            prediction_markets (
              id,
              category,
              status,
              total_pool,
              prize_amount,
              start_time,
              end_time
            )
          `)
          .eq('id', betId)
          .single();

        if (predictionError) throw predictionError;
        setPrediction(predictionData as Prediction);

        // Fetch odds history
        const { data: historyData } = await supabase
          .from('odds_history')
          .select('*')
          .eq('team_id', predictionData.team_id)
          .eq('market_id', predictionData.market_id)
          .gte('timestamp', predictionData.created_at)
          .order('timestamp', { ascending: true });

        setOddsHistory(historyData || []);

        // Fetch competitors
        const { data: competitorsData } = await supabase
          .from('market_odds')
          .select(`
            team_id,
            current_odds,
            volume,
            teams (name, logo_url)
          `)
          .eq('market_id', predictionData.market_id)
          .order('current_odds', { ascending: false });

        const formattedCompetitors = competitorsData?.map((c: any) => ({
          team_id: c.team_id,
          team_name: c.teams?.name || 'Unknown',
          team_logo: c.teams?.logo_url || '',
          current_odds: Number(c.current_odds),
          volume: c.volume,
          trend: 'neutral' as const
        })) || [];

        setCompetitors(formattedCompetitors);

        // Fetch activity feed
        const { data: activityData } = await supabase
          .from('progress_updates')
          .select('*')
          .eq('team_id', predictionData.team_id)
          .gte('created_at', predictionData.created_at)
          .order('created_at', { ascending: false })
          .limit(20);

        setActivities(activityData || []);

        // Set up real-time subscriptions
        const oddsChannel = supabase
          .channel(`bet-odds-${betId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'market_odds',
            filter: `team_id=eq.${predictionData.team_id}`
          }, () => {
            // Refresh odds data
          })
          .subscribe();

        const activityChannel = supabase
          .channel(`bet-activity-${betId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'progress_updates',
            filter: `team_id=eq.${predictionData.team_id}`
          }, (payload) => {
            setActivities(prev => [payload.new as any, ...prev]);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(oddsChannel);
          supabase.removeChannel(activityChannel);
        };
      } catch (error) {
        console.error('Error fetching bet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBetData();
  }, [betId]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Bet Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The bet you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/wallet')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wallet
              </Button>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const potentialPayout = Math.round((prediction.amount / prediction.odds_at_bet) * 100);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Button variant="ghost" size="sm" onClick={() => navigate('/wallet')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Bet #{prediction.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Status Banner */}
          <BetStatusBanner
            status={prediction.status}
            amount={prediction.amount}
            odds={prediction.odds_at_bet}
            payout={prediction.payout}
            potentialPayout={potentialPayout}
          />

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={prediction.teams.logo_url} />
                  <AvatarFallback>{prediction.teams.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{prediction.teams.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prediction.teams.category?.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market Category</p>
                      <p className="font-medium">{prediction.prediction_markets.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bet Placed</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Momentum Score</p>
                      <p className="font-medium">{prediction.teams.momentum_score.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium">{prediction.teams.current_progress}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <BetShareCard
              betId={prediction.id}
              teamName={prediction.teams.name}
              amount={prediction.amount}
              odds={prediction.odds_at_bet}
              status={prediction.status}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="odds">Odds History</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
              <TabsTrigger value="activity">Activity Feed</TabsTrigger>
              <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bet Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs">{prediction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Placed At</p>
                    <p className="text-sm">{format(new Date(prediction.created_at), 'PPp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Pool</p>
                    <p className="text-sm font-medium">{prediction.prediction_markets.total_pool} HC</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prize Amount</p>
                    <p className="text-sm font-medium">{prediction.prediction_markets.prize_amount} HC</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="odds">
              {oddsHistory.length > 0 ? (
                <OddsChart
                  data={oddsHistory}
                  betOdds={prediction.odds_at_bet}
                  betTimestamp={prediction.created_at}
                />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No historical odds data available</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="competition">
              <CompetitorTable
                competitors={competitors}
                userTeamId={prediction.team_id}
                totalPool={prediction.prediction_markets.total_pool}
              />
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <MarketActivityHeatmap />
              
              {activities.length > 0 ? (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Activity Timeline</h3>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <ActivityFeedItem
                        key={activity.id}
                        type={activity.type}
                        title={activity.title || 'Update'}
                        content={activity.content}
                        timestamp={activity.created_at}
                        metadata={activity.metadata}
                      />
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No activity to display</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="calculator">
              <ROICalculator
                currentOdds={prediction.odds_at_bet}
                betAmount={prediction.amount}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
