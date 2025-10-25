import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useMarketOdds } from '@/hooks/useMarketOdds';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MarketDetailModalProps {
  marketId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MarketDetailModal({ marketId, isOpen, onClose }: MarketDetailModalProps) {
  const [market, setMarket] = useState<any>(null);
  const { odds, loading } = useMarketOdds(marketId || undefined);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarket = async () => {
      const { data } = await supabase
        .from('prediction_markets')
        .select('*, sponsors(*)')
        .eq('id', marketId)
        .single();

      if (data) setMarket(data);
    };

    fetchMarket();
  }, [marketId]);

  if (!market) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{market.category}</DialogTitle>
              {market.sponsors && (
                <p className="text-sm text-muted-foreground mt-1">
                  Sponsored by {market.sponsors.name}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold">{market.prize_amount} HC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total Pool: {market.total_pool} HC
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="teams" className="flex-1">
          <TabsList>
            <TabsTrigger value="teams">Team Rankings</TabsTrigger>
            <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="flex-1">
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-3 pr-4">
                {odds.map((team, index) => (
                  <Card key={team.team_id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-lg font-bold w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{team.team_name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {team.current_odds.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Current Odds</p>
                          </div>
                          <div>
                            <p className="text-lg font-medium">{team.volume} HC</p>
                            <p className="text-xs text-muted-foreground">Volume</p>
                          </div>
                        </div>
                        
                        {/* Mini volume bar */}
                        <div className="w-full bg-muted rounded-full h-2 mt-3">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${team.current_odds}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Team
                        </Button>
                        <Button size="sm">
                          Quick Bet
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1">
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Odds Distribution Chart */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Odds Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={odds.map((team, i) => ({
                      name: team.team_name,
                      odds: team.current_odds,
                      volume: team.volume
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
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
                        strokeWidth={2}
                        name="Odds %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Bets</p>
                    <p className="text-2xl font-bold mt-1">{odds.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Avg Odds</p>
                    <p className="text-2xl font-bold mt-1">
                      {(odds.reduce((acc, t) => acc + t.current_odds, 0) / odds.length).toFixed(1)}%
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-1">{market.status}</Badge>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
