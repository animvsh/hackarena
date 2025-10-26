import React from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, TrendingUp, Users, Trophy } from 'lucide-react';

interface Step01WelcomeProps {
  onStart: () => void;
}

export const Step01Welcome: React.FC<Step01WelcomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Logo/Brand */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--neon-purple))]/20 border border-[hsl(var(--neon-purple))]/30 rounded-full">
          <div className="w-2 h-2 bg-[hsl(var(--neon-purple))] rounded-full animate-pulse" />
          <span className="text-sm text-white/80">LIVE</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white">
          HackArena
        </h1>
        
        <p className="text-xl md:text-2xl text-white/70">
          The ultimate hackathon prediction market
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
          <div className="w-12 h-12 bg-[hsl(var(--neon-purple))]/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[hsl(var(--neon-purple))]" />
          </div>
          <h3 className="text-white font-semibold">Trade Teams</h3>
          <p className="text-sm text-white/60">Bet on your favorites</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
          <div className="w-12 h-12 bg-[hsl(var(--neon-blue))]/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-[hsl(var(--neon-blue))]" />
          </div>
          <h3 className="text-white font-semibold">Build Teams</h3>
          <p className="text-sm text-white/60">Collaborate & compete</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
          <div className="w-12 h-12 bg-[hsl(var(--neon-cyan))]/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-[hsl(var(--neon-cyan))]" />
          </div>
          <h3 className="text-white font-semibold">Win Prizes</h3>
          <p className="text-sm text-white/60">Earn HackCoins</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
          <div className="w-12 h-12 bg-[hsl(var(--neon-pink))]/20 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-[hsl(var(--neon-pink))]" />
          </div>
          <h3 className="text-white font-semibold">Live Updates</h3>
          <p className="text-sm text-white/60">Real-time action</p>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onStart}
        size="lg"
        className="text-lg px-8 py-6 mt-8"
      >
        Get Started
      </Button>

      <p className="text-sm text-white/40">
        Takes less than 2 minutes
      </p>
    </div>
  );
};
