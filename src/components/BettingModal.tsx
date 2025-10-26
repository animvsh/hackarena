import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, profile } = useAuth();
  const [betAmount, setBetAmount] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    if (profile?.wallet_balance !== undefined) {
      setUserBalance(profile.wallet_balance);
    }
  }, [profile]);

  const calculatePotentialPayout = () => {
    const amount = parseInt(betAmount) || 0;
    const odds = team.current_odds / 100;
    return Math.floor(amount / odds);
  };

  const handlePlaceBet = async () => {
    // Check authentication
    if (!user) {
      toast.error("Please sign in to place bets");
      onOpenChange(false);
      return;
    }

    const amount = parseInt(betAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (amount > userBalance) {
      toast.error("Insufficient HackCoins!");
      return;
    }

    setIsPlacing(true);

    try {
      // Use optimized database function for atomic bet placement
      const { data, error } = await supabase.rpc('place_bet', {
        p_user_id: user.id,
        p_market_id: marketId,
        p_team_id: team.team_id,
        p_amount: amount,
        p_current_odds: team.current_odds,
      });

      if (error) throw error;

      // Update local balance
      setUserBalance(data.new_balance);

      toast.success(`Bet placed! ${amount} HC on ${team.team_name}`);
      onBetPlaced();
      onOpenChange(false);
      setBetAmount("");
    } catch (error: any) {
      if (error.message?.includes('Insufficient balance')) {
        toast.error("Insufficient HackCoins!");
      } else {
        toast.error(error.message || "Failed to place bet");
      }
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
              max={userBalance}
              disabled={!user}
            />
            <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount.toString())}
                  className="flex-1"
                  disabled={!user || amount > userBalance}
                >
                  {amount} HC
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {user ? `Balance: ${userBalance.toLocaleString()} HC` : 'Sign in to place bets'}
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
              disabled={!user || !betAmount || parseInt(betAmount) <= 0 || isPlacing}
              className="flex-1"
            >
              {isPlacing ? "Placing..." : !user ? "Sign in to bet" : `Bet ${betAmount || 0} HC`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
