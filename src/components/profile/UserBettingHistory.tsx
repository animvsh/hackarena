import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Prediction {
  id: string;
  amount: number;
  odds_at_bet: number;
  status: string;
  payout: number;
  created_at: string;
  market_id: string;
  team_id: string;
  prediction_markets?: {
    category: string;
  };
  teams?: {
    name: string;
  };
}

interface UserBettingHistoryProps {
  userId: string;
}

export function UserBettingHistory({ userId }: UserBettingHistoryProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      const { data } = await supabase
        .from('predictions')
        .select(`
          *,
          prediction_markets(category),
          teams(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setPredictions(data as any);
      }
      setLoading(false);
    };

    fetchPredictions();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'default';
      case 'lost': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-muted-foreground">Loading betting history...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Betting History</h3>
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{prediction.teams?.name}</p>
                    <Badge variant={getStatusColor(prediction.status) as any}>
                      {prediction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prediction.prediction_markets?.category}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Bet: <strong>{prediction.amount} HC</strong></span>
                    <span>Odds: <strong>{prediction.odds_at_bet.toFixed(1)}%</strong></span>
                    {prediction.payout > 0 && (
                      <span className="text-green-500">
                        Payout: <strong>{prediction.payout} HC</strong>
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {predictions.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No betting history</p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
