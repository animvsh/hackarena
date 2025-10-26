import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function BroadcastTestPanel() {
  const [isVisible, setIsVisible] = useState(false);

  const triggerBet = async () => {
    try {
      const teams = ['CodeCrusaders', 'BugBusters', 'APIAvengers', 'GitGurus', 'DataDragons'];
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      const amount = Math.floor(Math.random() * 900) + 100;

      // Get a team ID (we'll use the first team from the database)
      const { data: teamData } = await supabase
        .from('hackathon_teams')
        .select('id')
        .limit(1)
        .single();

      if (!teamData) {
        toast.error('No teams found in database');
        return;
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to test bets');
        return;
      }

      // Insert a test prediction to trigger the broadcast event
      const { error } = await supabase
        .from('predictions')
        .insert({
          user_id: user.id,
          team_id: teamData.id,
          market_id: teamData.id, // Using team_id as market_id for demo
          amount: amount,
          odds_at_bet: 2.5,
          status: 'pending'
        });

      if (error) throw error;

      toast.success(`Test bet placed: ${amount} coins!`);
    } catch (error) {
      console.error('Test bet failed:', error);
      toast.error('Failed to trigger test bet');
    }
  };

  const triggerOddsChange = async () => {
    try {
      // Get a random odds record
      const { data: oddsData } = await supabase
        .from('market_odds')
        .select('*')
        .limit(1)
        .single();

      if (!oddsData) {
        toast.error('No odds found in database');
        return;
      }

      // Update odds to trigger event
      const change = (Math.random() - 0.5) * 30; // +/- 15%
      const newOdds = Math.max(5, Math.min(95, oddsData.current_odds + change));

      const { error } = await supabase
        .from('market_odds')
        .update({ current_odds: newOdds })
        .eq('id', oddsData.id);

      if (error) throw error;

      toast.success(`Odds changed by ${change.toFixed(1)}%`);
    } catch (error) {
      console.error('Odds change failed:', error);
      toast.error('Failed to trigger odds change');
    }
  };

  const triggerTeamUpdate = async () => {
    try {
      const { data: teamData } = await supabase
        .from('hackathon_teams')
        .select('*')
        .limit(1)
        .single();

      if (!teamData) {
        toast.error('No teams found');
        return;
      }

      const progressIncrease = Math.floor(Math.random() * 15) + 1;
      const newProgress = teamData.current_progress + progressIncrease;

      const { error } = await supabase
        .from('hackathon_teams')
        .update({ current_progress: newProgress })
        .eq('id', teamData.id);

      if (error) throw error;

      toast.success(`Team progress +${progressIncrease}`);
    } catch (error) {
      console.error('Team update failed:', error);
      toast.error('Failed to trigger team update');
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-[100] bg-card/80 backdrop-blur-sm"
      >
        🎬 Broadcast Test Panel
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-[100] p-4 bg-card/95 backdrop-blur-md border-primary/20 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-primary">🎬 Broadcast Test Panel</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Trigger events to test the real-time broadcast system:
        </p>

        <Button
          onClick={triggerBet}
          variant="default"
          size="sm"
          className="w-full justify-start"
        >
          💰 Place Test Bet
        </Button>

        <Button
          onClick={triggerOddsChange}
          variant="default"
          size="sm"
          className="w-full justify-start"
        >
          📈 Change Odds
        </Button>

        <Button
          onClick={triggerTeamUpdate}
          variant="default"
          size="sm"
          className="w-full justify-start"
        >
          🚀 Team Progress
        </Button>

        <div className="pt-2 border-t border-border mt-3">
          <p className="text-xs text-muted-foreground">
            💡 Events will trigger real-time broadcast commentary
          </p>
        </div>
      </div>
    </Card>
  );
}
