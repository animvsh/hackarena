import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CompletionStepProps {
  onComplete: () => void;
  userName: string;
}

export const CompletionStep = ({ onComplete, userName }: CompletionStepProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 1000) {
          clearInterval(interval);
          return 1000;
        }
        return prev + 50;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 text-center">
      <div className="space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-cyan-green rounded-full mb-4 animate-bounce">
          <Coins className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
          You're all set,<br />
          {userName}! 🎉
        </h1>
        
        <div className="inline-block p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
          <p className="text-white/80 text-lg mb-2">Your starting balance</p>
          <p className="text-7xl font-bold text-white tabular-nums">{count}</p>
          <p className="text-2xl text-white/60 mt-2">HackCoins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-3 mx-auto">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-white/80">Make accurate predictions</p>
        </div>
        
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-cyan-green rounded-xl flex items-center justify-center mb-3 mx-auto">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <p className="text-white/80">Bet on trending teams early</p>
        </div>
        
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-orange-pink rounded-xl flex items-center justify-center mb-3 mx-auto">
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="text-white/80">Join the leaderboard</p>
        </div>
      </div>

      <Button
        onClick={onComplete}
        size="lg"
        className="text-lg px-12 py-6 h-auto bg-white text-purple-600 hover:bg-white/90 font-bold"
      >
        Enter the Arena →
      </Button>
    </div>
  );
};
