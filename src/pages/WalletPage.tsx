import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Trophy, History, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  wallet_balance: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  xrp_destination_tag?: string;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [xrpAmount, setXrpAmount] = useState("");
  
  // Company XRP wallet address (you'll need to generate this)
  const COMPANY_XRP_WALLET = "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg";
  const XRP_TO_HACKCOIN_RATE = 100; // 1 XRP = 100 HackCoins

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
        setPredictions(predictionsData as Prediction[]);
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

  const handleAddMoney = () => {
    const amount = parseFloat(xrpAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid XRP amount",
        variant: "destructive",
      });
      return;
    }

    // Generate payment instructions
    const hackcoinsToReceive = Math.floor(amount * XRP_TO_HACKCOIN_RATE);
    
    toast({
      title: "✅ Payment Instructions Ready",
      description: `Send ${amount} XRP to ${COMPANY_XRP_WALLET} with destination tag ${user?.xrp_destination_tag}. You will receive ${hackcoinsToReceive} HackCoins once confirmed (usually < 60 seconds).`,
      duration: 15000,
    });
    
    setAddMoneyOpen(false);
    setXrpAmount("");
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">My Wallet</h1>
            </div>
            <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Money (XRP)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money with XRP</DialogTitle>
                  <DialogDescription>
                    Send XRP to receive HackCoins. Rate: 1 XRP = {XRP_TO_HACKCOIN_RATE} HC
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="xrp-amount">XRP Amount</Label>
                    <Input
                      id="xrp-amount"
                      type="number"
                      placeholder="10"
                      value={xrpAmount}
                      onChange={(e) => setXrpAmount(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                    {xrpAmount && parseFloat(xrpAmount) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        You will receive: <strong>{Math.floor(parseFloat(xrpAmount) * XRP_TO_HACKCOIN_RATE)} HackCoins</strong>
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 rounded-lg bg-muted p-4">
                    <div>
                      <Label className="text-xs font-semibold">1. Send XRP To:</Label>
                      <p className="text-xs font-mono break-all mt-1 bg-background p-2 rounded">
                        {COMPANY_XRP_WALLET}
                      </p>
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <Label className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        ⚠️ 2. IMPORTANT - Include Destination Tag:
                      </Label>
                      <p className="text-lg font-bold font-mono mt-1 bg-background p-3 rounded text-center border-2 border-orange-500">
                        {user?.xrp_destination_tag || "Loading..."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>This is YOUR unique tag.</strong> Without it, we won't be able to identify your payment and credit your account!
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      💡 Your HackCoins will be credited automatically within 60 seconds after the XRP Ledger confirms your transaction.
                    </p>
                  </div>
                  <Button onClick={handleAddMoney} className="w-full">
                    Generate Payment Instructions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                      className="flex items-center justify-between p-4 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate(`/bets/${prediction.id}`)}
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
                        className="flex items-center justify-between p-4 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => navigate(`/bets/${prediction.id}`)}
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
                        className="flex items-center justify-between p-4 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => navigate(`/bets/${prediction.id}`)}
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
                        className="flex items-center justify-between p-4 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => navigate(`/bets/${prediction.id}`)}
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
      </div>
    </AppLayout>
  );
};

export default WalletPage;
