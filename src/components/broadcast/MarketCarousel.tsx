import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, Trophy, Clock, BarChart3 } from 'lucide-react';

interface Market {
  id: string;
  category: string;
  prize_amount: number;
  total_pool: number;
  status: string;
  end_time: string | null;
}

interface MarketCarouselProps {
  onMarketClick?: (marketId: string) => void;
  hackathonId?: string;
}

export function MarketCarousel({ onMarketClick, hackathonId }: MarketCarouselProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      let query = supabase
        .from('prediction_markets')
        .select('*')
        .eq('status', 'open');
      
      if (hackathonId) {
        query = query.eq('hackathon_id', hackathonId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setMarkets(data);
      }
      setLoading(false);
    };

    fetchMarkets();
  }, [hackathonId]);

  const hotMarkets = [...markets].sort((a, b) => b.total_pool - a.total_pool);
  const byPrize = [...markets].sort((a, b) => b.prize_amount - a.prize_amount);
  const closingSoon = markets.filter(m => m.end_time).sort((a, b) => 
    new Date(a.end_time!).getTime() - new Date(b.end_time!).getTime()
  );

  const MarketCard = ({ market }: { market: Market }) => (
    <Card 
      className="min-w-[300px] p-4 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
      onClick={() => onMarketClick?.(market.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm">{market.category}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Prize: {market.prize_amount} HC
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {market.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total Pool</span>
          <span className="font-medium">{market.total_pool} HC</span>
        </div>
        {market.end_time && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Closes</span>
            <span className="font-medium">
              {new Date(market.end_time).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <Button size="sm" className="w-full">
        View Market
      </Button>
    </Card>
  );

  return (
    <Tabs defaultValue="hot" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger value="hot" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
          <Flame className="w-4 h-4" />
          Hot Markets
        </TabsTrigger>
        <TabsTrigger value="prize" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
          <Trophy className="w-4 h-4" />
          By Prize
        </TabsTrigger>
        <TabsTrigger value="closing" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
          <Clock className="w-4 h-4" />
          Closing Soon
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
          <BarChart3 className="w-4 h-4" />
          All Markets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="hot" className="mt-4">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {hotMarkets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="prize" className="mt-4">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {byPrize.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="closing" className="mt-4">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {closingSoon.length > 0 ? (
              closingSoon.map(market => (
                <MarketCard key={market.id} market={market} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No markets closing soon</p>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="all" className="mt-4">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {markets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
