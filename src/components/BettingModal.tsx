import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Coins, TrendingUp, AlertCircle } from "lucide-react";

interface BettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: string;
  marketCategory: string;
  team: {
    team_id: string;
    team_name: string;
    team_logo: string;
    current_odds: number;
  };
  onBetPlaced: () => void;
}

export const BettingModal = ({
  open,
  onOpenChange,
  marketId,
  marketCategory,
  team,
  onBetPlaced,
}: BettingModalProps) => {
  const [betAmount, setBetAmount] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);

  // Mock user - in production, get from auth
  const mockUserId = "00000000-0000-0000-0000-000000000001";
  const mockUserBalance = 1500; // Get from user context

  const calculatePotentialPayout = () => {
    const amount = parseInt(betAmount) || 0;
    const odds = team.current_odds / 100;
    return Math.floor(amount / odds);
  };

  const handlePlaceBet = async () => {
    const amount = parseInt(betAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (amount > mockUserBalance) {
      toast.error("Insufficient HackCoins!");
      return;
    }

    setIsPlacing(true);

    try {
      // Insert the prediction
      const { data: prediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          user_id: mockUserId,
          market_id: marketId,
          team_id: team.team_id,
          amount: amount,
          odds_at_bet: team.current_odds,
        })
        .select()
        .single();

      if (predictionError) throw predictionError;

      // Get current volume
      const { data: currentOdds } = await supabase
        .from('market_odds')
        .select('volume')
        .eq('market_id', marketId)
        .eq('team_id', team.team_id)
        .single();

      // Update market odds with new volume
      const newVolume = (currentOdds?.volume || 0) + amount;
      const { error: oddsError } = await supabase
        .from('market_odds')
        .update({
          volume: newVolume,
          last_updated: new Date().toISOString(),
        })
        .eq('market_id', marketId)
        .eq('team_id', team.team_id);

      if (oddsError) throw oddsError;

      // Recalculate odds for all teams in this market
      const { data: allOdds } = await supabase
        .from('market_odds')
        .select('id, volume')
        .eq('market_id', marketId);

      if (allOdds) {
        const totalVolume = allOdds.reduce((sum, odd) => sum + (odd.volume || 0), 0);

        // Update odds for each team
        for (const odd of allOdds) {
          const newOdds = totalVolume > 0 ? ((odd.volume || 0) / totalVolume) * 100 : 0;
          await supabase
            .from('market_odds')
            .update({ current_odds: newOdds })
            .eq('id', odd.id);
        }
      }

      toast.success(`Bet placed! ${amount} HC on ${team.team_name}`);
      onBetPlaced();
      onOpenChange(false);
      setBetAmount("");
    } catch (error: any) {
      console.error('Bet placement error:', error);
      toast.error(error.message || "Failed to place bet");
    } finally {
      setIsPlacing(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Place Bet
          </DialogTitle>
          <DialogDescription>{marketCategory}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Info */}
          <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
            <img
              src={team.team_logo}
              alt={team.team_name}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1">
              <p className="font-semibold">{team.team_name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                Current Odds: {team.current_odds.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Bet Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="bet-amount">Bet Amount (HackCoins)</Label>
            <Input
              id="bet-amount"
              type="number"
              placeholder="Enter amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={mockUserBalance}
            />
            <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount.toString())}
                  className="flex-1"
                >
                  {amount} HC
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {mockUserBalance} HC
            </p>
          </div>

          {/* Potential Payout */}
          {betAmount && parseInt(betAmount) > 0 && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential Payout:</span>
                <span className="text-lg font-bold text-primary">
                  {calculatePotentialPayout()} HC
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">Profit:</span>
                <span className="text-sm font-semibold text-green-500">
                  +{calculatePotentialPayout() - parseInt(betAmount)} HC
                </span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Odds may change after you place your bet. Your payout is locked at current odds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              disabled={!betAmount || parseInt(betAmount) <= 0 || isPlacing}
              className="flex-1"
            >
              {isPlacing ? "Placing..." : `Bet ${betAmount || 0} HC`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
