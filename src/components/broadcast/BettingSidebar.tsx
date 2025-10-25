import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, Clock, Trophy, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BettingModal } from '@/components/BettingModal';
import { useMarketOdds } from '@/hooks/useMarketOdds';

interface Market {
  id: string;
  category: string;
  prize_amount: number;
  total_pool: number;
  status: string;
  sponsor_id: string;
}

interface BettingSidebarProps {
  onMarketClick?: (marketId: string) => void;
}

export function BettingSidebar({ onMarketClick }: BettingSidebarProps) {
  const navigate = useNavigate();
  const [hotMarkets, setHotMarkets] = useState<Market[]>([]);
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [bettingModalOpen, setBettingModalOpen] = useState(false);
  const [quickBetAmount, setQuickBetAmount] = useState(50);
  const { odds } = useMarketOdds(hotMarkets[0]?.id);

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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'market_odds'
      }, fetchHotMarkets)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleQuickBet = (market: Market, teamData: any) => {
    setSelectedMarket(market);
    setSelectedTeam({
      id: teamData.team_id,
      name: teamData.team_name,
      logo_url: teamData.logo_url
    });
    setBettingModalOpen(true);
  };

  const handleViewTeam = (teamData: any) => {
    if (teamData.team_id) {
      navigate(`/teams/${teamData.team_id}`);
    }
  };

  return (
    <>
      <div className="h-full bg-card border-l border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
            Live Betting
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Real-time odds & quick bets</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Live Updates Feed */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                Live Updates
              </h4>
              <div className="space-y-2">
                {tickerItems.slice(0, 5).map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-3 bg-muted/50 hover:bg-muted transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg"
                    onClick={() => item.team_name && handleViewTeam({ team_name: item.team_name })}
                  >
                    <p className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                      {item.priority === 'breaking' && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">LIVE</Badge>
                      )}
                    </p>
                    <p className="text-sm mt-1 line-clamp-2">{item.text}</p>
                    {item.team_name && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {item.team_name}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Hot Markets with Live Odds */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Hot Markets
              </h4>
              <div className="space-y-3">
                {hotMarkets.map((market) => (
                  <Card key={market.id} className="p-4 hover:border-primary/50 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                           onClick={() => onMarketClick?.(market.id)}>
                          {market.category}
                        </p>
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

                    {/* Top Teams with Live Odds */}
                    {odds.slice(0, 2).map((team, idx) => (
                      <div key={team.team_id} className="flex items-center justify-between py-2 border-t border-border">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                          <span className="text-sm truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleViewTeam(team)}>
                            {team.team_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {team.current_odds > 50 ? (
                              <ArrowUpRight className="w-3 h-3 text-success" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-destructive" />
                            )}
                            <span className="text-sm font-bold text-primary">
                              {team.current_odds.toFixed(1)}%
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleQuickBet(market, team)}
                          >
                            Bet
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Quick Bet Amount Selector */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type="number"
                          value={quickBetAmount}
                          onChange={(e) => setQuickBetAmount(Number(e.target.value))}
                          className="h-7 text-xs"
                          min="1"
                        />
                        <span className="text-xs text-muted-foreground">HC</span>
                      </div>
                      <div className="flex gap-2">
                        {[25, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            size="sm"
                            variant={quickBetAmount === amount ? "default" : "outline"}
                            className="flex-1 text-xs h-6"
                            onClick={() => setQuickBetAmount(amount)}
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-3 text-xs h-7"
                      onClick={() => onMarketClick?.(market.id)}
                    >
                      View Full Market
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
                  Place your first bet to track it here
                </p>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Betting Modal */}
      {selectedMarket && selectedTeam && (
        <BettingModal
          open={bettingModalOpen}
          onOpenChange={setBettingModalOpen}
          marketId={selectedMarket.id}
          marketCategory={selectedMarket.category}
          team={{
            team_id: selectedTeam.id,
            team_name: selectedTeam.name,
            team_logo: selectedTeam.logo_url || '',
            current_odds: odds.find(o => o.team_id === selectedTeam.id)?.current_odds || 50
          }}
          onBetPlaced={() => {
            setBettingModalOpen(false);
          }}
        />
      )}
    </>
  );
}
