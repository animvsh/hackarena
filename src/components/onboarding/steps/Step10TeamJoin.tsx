import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Step10TeamJoinProps {
  userId: string;
  onTeamJoined: (teamId: string) => void;
  onBack: () => void;
}

export const Step10TeamJoin: React.FC<Step10TeamJoinProps> = ({
  userId,
  onTeamJoined,
  onBack,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('join-team', {
        body: {
          invite_code: inviteCode.trim(),
          user_id: userId,
        },
      });

      if (error) throw error;

      if (data?.team_id) {
        onTeamJoined(data.team_id);
      }
    } catch (error: any) {
      console.error('Error joining team:', error);
      toast({
        title: 'Invalid invite code',
        description: error.message || 'Please check the code and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep
      question="Enter your invite code"
      helper="Ask your team leader for the 6-character invite code"
      onNext={inviteCode.trim().length >= 6 && !loading ? handleJoin : undefined}
      onBack={onBack}
      nextDisabled={inviteCode.trim().length < 6 || loading}
      nextLabel={loading ? 'Joining...' : 'Join Team'}
    >
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-[hsl(var(--neon-purple))] animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Input
            autoFocus
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="text-3xl h-16 text-center tracking-wider font-mono bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20"
            maxLength={6}
          />
          <p className="text-sm text-white/40 mt-2 text-center">
            6-character code
          </p>
        </div>
      )}
    </OnboardingStep>
  );
};
