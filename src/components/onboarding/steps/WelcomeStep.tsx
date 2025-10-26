import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Trophy } from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
}

export const WelcomeStep = ({ onContinue }: WelcomeStepProps) => {
  return (
    <div className="space-y-12 text-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-white">LIVE NOW</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
          Welcome to<br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            HackArena
          </span>
        </h1>
        
        <p className="text-2xl text-white/80 max-w-2xl mx-auto">
          The world's first AI-powered hackathon prediction market
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-4 mx-auto">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Markets</h3>
          <p className="text-white/60">Bet on hackathon teams in real-time</p>
        </div>
        
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-cyan-green rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Commentary</h3>
          <p className="text-white/60">Follow live AI-powered broadcasts</p>
        </div>
        
        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-orange-pink rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Win Rewards</h3>
          <p className="text-white/60">Earn HackCoins with accurate predictions</p>
        </div>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="text-lg px-12 py-6 h-auto bg-white text-purple-600 hover:bg-white/90 font-bold"
      >
        Get Started →
      </Button>
    </div>
  );
};
