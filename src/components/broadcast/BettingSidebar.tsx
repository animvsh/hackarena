import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Trophy, DollarSign } from 'lucide-react';

interface Market {
  id: string;
  category: string;
  prize_amount: number;
  total_pool: number;
  status: string;
  sponsor_id: string;
}

interface QuickBetTeam {
  team_id: string;
  team_name: string;
  current_odds: number;
}

export function BettingSidebar() {
  const [hotMarkets, setHotMarkets] = useState<Market[]>([]);
  const [tickerItems, setTickerItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchHotMarkets = async () => {
      const { data } = await supabase
        .from('prediction_markets')
        .select('*')
        .eq('status', 'open')
        .order('total_pool', { ascending: false })
        .limit(3);
      
      if (data) setHotMarkets(data);
    };

    const fetchTicker = async () => {
      const { data } = await supabase
        .from('broadcast_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setTickerItems(data);
    };

    fetchHotMarkets();
    fetchTicker();

    // Real-time updates
    const channel = supabase
      .channel('betting-sidebar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'broadcast_content'
      }, fetchTicker)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Live Betting
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Live Commentary Feed */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              Live Updates
            </h4>
            <div className="space-y-2">
              {tickerItems.slice(0, 5).map((item) => (
                <Card key={item.id} className="p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </p>
                  <p className="text-sm mt-1">{item.text}</p>
                  {item.team_name && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {item.team_name}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Hot Markets */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Hot Markets
            </h4>
            <div className="space-y-3">
              {hotMarkets.map((market) => (
                <Card key={market.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{market.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {market.prize_amount} HC Prize
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {market.total_pool} HC
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {[25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                      >
                        {amount} HC
                      </Button>
                    ))}
                  </div>
                  
                  <Button size="sm" className="w-full mt-2 text-xs h-7">
                    View Market
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Your Active Bets */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-info" />
              Your Bets
            </h4>
            <Card className="p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Place your first bet to see it here
              </p>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
