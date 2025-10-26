import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Step11CompletionProps {
  userName: string;
  inviteCode?: string;
  teamName?: string;
  onComplete: () => void;
}

export const Step11Completion: React.FC<Step11CompletionProps> = ({
  userName,
  inviteCode,
  teamName,
  onComplete,
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // Confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#9D4EDD', '#4A90E2', '#06D6A0', '#F72585'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleCopy = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Success Message */}
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-[hsl(var(--neon-purple))]/20 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-[hsl(var(--neon-purple))]" />
        </div>
        
        <h1 className="text-5xl font-bold text-white">
          Welcome to HackArena, {userName}!
        </h1>
        
        <p className="text-xl text-white/70">
          You're all set and ready to start
        </p>
      </div>

      {/* Starting Balance */}
      <Card className="bg-gradient-to-br from-[hsl(var(--neon-purple))]/20 to-[hsl(var(--neon-blue))]/20 border-[hsl(var(--neon-purple))]/30 p-8 max-w-md w-full">
        <div className="text-center space-y-2">
          <p className="text-white/70">Starting Balance</p>
          <p className="text-5xl font-bold text-white">
            1,000 <span className="text-2xl text-[hsl(var(--neon-purple))]">HC</span>
          </p>
          <p className="text-sm text-white/60">HackCoins to get you started</p>
        </div>
      </Card>

      {/* Invite Code (if team created) */}
      {inviteCode && teamName && (
        <Card className="bg-white/5 border-white/10 p-6 max-w-md w-full">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Team Created: {teamName}
            </h3>
            <p className="text-sm text-white/60">
              Share this code with your teammates:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-mono bg-white/10 border border-white/20 rounded-lg p-3 text-center text-white">
                {inviteCode}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-lg font-semibold text-white">What's next?</h3>
        <ul className="text-left space-y-2 text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-[hsl(var(--neon-purple))]">•</span>
            Explore live hackathon markets
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[hsl(var(--neon-purple))]">•</span>
            Place bets on your favorite teams
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[hsl(var(--neon-purple))]">•</span>
            Watch the live broadcast
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[hsl(var(--neon-purple))]">•</span>
            Climb the leaderboard
          </li>
        </ul>
      </div>

      {/* CTA */}
      <Button
        onClick={onComplete}
        size="lg"
        className="text-lg px-8 py-6 gap-2"
      >
        Start Exploring
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
