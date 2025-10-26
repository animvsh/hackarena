import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Code, Users, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  prize_pool: number;
}

interface APIUsageData {
  team_id: string;
  endpoint: string;
  call_count: number;
  teams: {
    name: string;
    logo_url: string;
  };
}

interface MarketData {
  category: string;
  prize_amount: number;
  total_pool: number;
  status: string;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [apiUsage, setApiUsage] = useState<APIUsageData[]>([]);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  useEffect(() => {
    if (selectedSponsor) {
      fetchSponsorAnalytics(selectedSponsor.id);
    }
  }, [selectedSponsor]);

  const fetchSponsors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('prize_pool', { ascending: false });

    if (data && !error) {
      setSponsors(data);
      if (data.length > 0) {
        setSelectedSponsor(data[0]);
      }
    }
    setLoading(false);
  };

  const fetchSponsorAnalytics = async (sponsorId: string) => {
    // Fetch API usage
    const { data: usage } = await supabase
      .from('api_usage')
      .select(`
        team_id,
        endpoint,
        call_count,
        teams (
          name,
          logo_url
        )
      `)
      .eq('sponsor_id', sponsorId);

    if (usage) {
      setApiUsage(usage as any);
    }

    // Fetch prediction markets
    const { data: marketData } = await supabase
      .from('prediction_markets')
      .select('category, prize_amount, total_pool, status')
      .eq('sponsor_id', sponsorId);

    if (marketData) {
      setMarkets(marketData);
    }
  };

  const getTotalAPICalls = () => {
    return apiUsage.reduce((sum, usage) => sum + usage.call_count, 0);
  };

  const getActiveTeams = () => {
    return new Set(apiUsage.map(u => u.team_id)).size;
  };

  const getTotalBetsPlaced = () => {
    return markets.reduce((sum, m) => sum + m.total_pool, 0);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-neon-green" />
            <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Track API usage, engagement metrics, and market performance
          </p>
        </div>

        {/* Sponsor Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {sponsors.map((sponsor) => (
            <Card
              key={sponsor.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                selectedSponsor?.id === sponsor.id
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
              onClick={() => setSelectedSponsor(sponsor)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                {sponsor.logo_url && (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="w-12 h-12 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm">{sponsor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${sponsor.prize_pool.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Content */}
        {selectedSponsor && (
          <div className="space-y-6">
            {/* Header Info */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                {selectedSponsor.logo_url && (
                  <img
                    src={selectedSponsor.logo_url}
                    alt={selectedSponsor.name}
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedSponsor.name}</h2>
                  {selectedSponsor.description && (
                    <p className="text-muted-foreground mb-2">
                      {selectedSponsor.description}
                    </p>
                  )}
                  {selectedSponsor.website && (
                    <a
                      href={selectedSponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedSponsor.website}
                    </a>
                  )}
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  ${selectedSponsor.prize_pool.toLocaleString()}
                </Badge>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Code className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total API Calls</p>
                    <p className="text-2xl font-bold">{getTotalAPICalls().toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Teams</p>
                    <p className="text-2xl font-bold">{getActiveTeams()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prediction Markets</p>
                    <p className="text-2xl font-bold">{markets.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bets Placed</p>
                    <p className="text-2xl font-bold">{getTotalBetsPlaced()} HC</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="api-usage" className="w-full">
              <TabsList>
                <TabsTrigger value="api-usage">API Usage</TabsTrigger>
                <TabsTrigger value="markets">Markets</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>

              <TabsContent value="api-usage" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">API Usage by Team</h3>
                  {apiUsage.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No API usage recorded yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {apiUsage.map((usage, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-background rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={usage.teams.logo_url}
                              alt={usage.teams.name}
                              className="w-10 h-10 rounded"
                            />
                            <div>
                              <p className="font-semibold">{usage.teams.name}</p>
                              <p className="text-sm text-muted-foreground">{usage.endpoint}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {usage.call_count.toLocaleString()} calls
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="markets" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Prediction Markets</h3>
                  {markets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No markets created yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {markets.map((market, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-background rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{market.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Prize: ${market.prize_amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={market.status === 'open' ? 'default' : 'secondary'}
                            >
                              {market.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {market.total_pool} HC wagered
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Avg API Calls/Team</p>
                      <p className="text-3xl font-bold">
                        {getActiveTeams() > 0
                          ? Math.round(getTotalAPICalls() / getActiveTeams())
                          : 0}
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Market Participation</p>
                      <p className="text-3xl font-bold">
                        {markets.filter(m => m.total_pool > 0).length}/{markets.length}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
        </Tabs>
      </div>
    )}
      </div>
    </AppLayout>
  );
};

export default Sponsors;
