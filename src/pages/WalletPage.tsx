import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Trophy, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  username: string;
  wallet_balance: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
}

interface Prediction {
  id: string;
  amount: number;
  odds_at_bet: number;
  status: string;
  payout: number;
  created_at: string;
  teams: {
    name: string;
    logo_url: string;
  };
  prediction_markets: {
    category: string;
  };
}

const WalletPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);

    // Get first user for demo
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (userData) {
      setUser(userData);

      // Fetch user's predictions
      const { data: predictionsData } = await supabase
        .from('predictions')
        .select(`
          *,
          teams (name, logo_url),
          prediction_markets (category)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (predictionsData) {
        setPredictions(predictionsData as any);
      }
    }

    setLoading(false);
  };

  const getAccuracyRate = () => {
    if (!user || user.total_predictions === 0) return 0;
    return ((user.correct_predictions / user.total_predictions) * 100).toFixed(1);
  };

  const getPredictionStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/20 text-green-500';
      case 'lost':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">My Wallet</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your HackCoins and track prediction performance
          </p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary to-purple-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <p className="text-sm opacity-80">Current Balance</p>
            </div>
            <p className="text-4xl font-bold mb-2">
              {user?.wallet_balance?.toLocaleString() || 0} HC
            </p>
            <p className="text-xs opacity-80">HackCoins</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <p className="text-4xl font-bold mb-2">
              {user?.xp?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-muted-foreground">Experience Points</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
            <p className="text-4xl font-bold mb-2">{getAccuracyRate()}%</p>
            <p className="text-xs text-muted-foreground">
              {user?.correct_predictions || 0} / {user?.total_predictions || 0} correct
            </p>
          </Card>
        </div>

        {/* Prediction History */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              <History className="w-4 h-4 mr-2" />
              All Predictions
            </TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Prediction History</h3>
              {predictions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No predictions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visit the Markets page to place your first bet!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={prediction.teams.logo_url}
                          alt={prediction.teams.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{prediction.teams.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prediction.prediction_markets.category}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(prediction.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right mr-4">
                        <p className="text-sm text-muted-foreground">Bet Amount</p>
                        <p className="font-bold">{prediction.amount} HC</p>
                        <p className="text-xs text-muted-foreground">
                          @ {prediction.odds_at_bet.toFixed(1)}% odds
                        </p>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`${getPredictionStatusColor(prediction.status)} mb-2`}
                        >
                          {prediction.status.toUpperCase()}
                        </Badge>
                        {prediction.payout > 0 && (
                          <p className="text-sm font-semibold text-green-500">
                            +{prediction.payout} HC
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pending Predictions</h3>
              <div className="space-y-3">
                {predictions.filter((p) => p.status === 'pending').length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No pending predictions
                  </p>
                ) : (
                  predictions
                    .filter((p) => p.status === 'pending')
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={prediction.teams.logo_url}
                            alt={prediction.teams.name}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div>
                            <p className="font-semibold">{prediction.teams.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {prediction.prediction_markets.category}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold">{prediction.amount} HC</p>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="won" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Winning Predictions</h3>
              <div className="space-y-3">
                {predictions.filter((p) => p.status === 'won').length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No winning predictions yet
                  </p>
                ) : (
                  predictions
                    .filter((p) => p.status === 'won')
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={prediction.teams.logo_url}
                            alt={prediction.teams.name}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div>
                            <p className="font-semibold">{prediction.teams.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {prediction.prediction_markets.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">
                            +{prediction.payout} HC
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Bet: {prediction.amount} HC
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lost" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lost Predictions</h3>
              <div className="space-y-3">
                {predictions.filter((p) => p.status === 'lost').length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No lost predictions
                  </p>
                ) : (
                  predictions
                    .filter((p) => p.status === 'lost')
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={prediction.teams.logo_url}
                            alt={prediction.teams.name}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div>
                            <p className="font-semibold">{prediction.teams.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {prediction.prediction_markets.category}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-red-500">
                          -{prediction.amount} HC
                        </p>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WalletPage;
