import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface ROICalculatorProps {
  currentOdds: number;
  betAmount: number;
}

export function ROICalculator({ currentOdds, betAmount }: ROICalculatorProps) {
  const [hypotheticalAmount, setHypotheticalAmount] = useState(betAmount);
  const [hypotheticalOdds, setHypotheticalOdds] = useState(currentOdds);

  const calculatePayout = (amount: number, odds: number) => {
    return Math.round((amount / odds) * 100);
  };

  const calculateROI = (amount: number, payout: number) => {
    return ((payout - amount) / amount * 100).toFixed(1);
  };

  const actualPayout = calculatePayout(betAmount, currentOdds);
  const hypotheticalPayout = calculatePayout(hypotheticalAmount, hypotheticalOdds);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">What-If Calculator</h3>
      
      <div className="space-y-6">
        <div>
          <Label>Hypothetical Bet Amount: {hypotheticalAmount} HC</Label>
          <Slider
            value={[hypotheticalAmount]}
            onValueChange={(value) => setHypotheticalAmount(value[0])}
            min={10}
            max={5000}
            step={10}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Hypothetical Odds: {hypotheticalOdds.toFixed(1)}%</Label>
          <Slider
            value={[hypotheticalOdds]}
            onValueChange={(value) => setHypotheticalOdds(value[0])}
            min={1}
            max={100}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h4 className="font-semibold mb-4">Your Actual Bet</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{betAmount} HC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odds:</span>
                <span className="font-medium">{currentOdds.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-medium">{actualPayout} HC</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">ROI:</span>
                <span className="font-semibold text-green-500">
                  +{calculateROI(betAmount, actualPayout)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hypothetical Scenario</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{hypotheticalAmount} HC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odds:</span>
                <span className="font-medium">{hypotheticalOdds.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-medium">{hypotheticalPayout} HC</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">ROI:</span>
                <span className="font-semibold text-blue-500">
                  +{calculateROI(hypotheticalAmount, hypotheticalPayout)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Difference: If you had bet {hypotheticalAmount} HC at {hypotheticalOdds.toFixed(1)}% odds,
            you would {hypotheticalPayout > actualPayout ? 'gain' : 'lose'} {' '}
            <span className="font-semibold">
              {Math.abs(hypotheticalPayout - actualPayout)} HC
            </span> compared to your actual bet.
          </p>
        </div>
      </div>
    </Card>
  );
}
