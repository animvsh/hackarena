import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface QuickBetWidgetProps {
  teamId: string;
  teamName: string;
  currentOdds: number;
  marketId: string;
  onBetClick: (amount: number) => void;
}

const QUICK_AMOUNTS = [100, 250, 500, 1000];

export function QuickBetWidget({ teamName, currentOdds, onBetClick }: QuickBetWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState(100);

  const potentialPayout = (selectedAmount * (100 / currentOdds)).toFixed(0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Quick Bet
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Team</p>
        <p className="font-medium">{teamName}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Current Odds</p>
        <Badge variant="secondary" className="text-lg mt-1">
          {currentOdds.toFixed(1)}%
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Quick Amount</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAmount(amount)}
            >
              {amount} HC
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Potential Payout</p>
        <p className="text-2xl font-bold text-primary">{potentialPayout} HC</p>
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={() => onBetClick(selectedAmount)}
      >
        Place Bet
      </Button>
    </Card>
  );
}
