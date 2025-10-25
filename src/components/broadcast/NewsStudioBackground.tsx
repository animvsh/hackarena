import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

interface NewsStudioBackgroundProps {
  scene: BroadcastScene;
}

export function NewsStudioBackground({ scene }: NewsStudioBackgroundProps) {
  const [lightPosition, setLightPosition] = useState(0);

  // Subtle camera movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLightPosition(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Studio backdrop with dynamic lighting gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-card to-card transition-all duration-1000"
        style={{
          backgroundPosition: `${Math.sin(lightPosition * 0.01) * 5}px ${Math.cos(lightPosition * 0.01) * 5}px`
        }}
      />
      
      {/* Animated studio lights with subtle movement */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] animate-pulse"
        style={{
          transform: `translateX(${Math.sin(lightPosition * 0.02) * 10}px)`
        }}
      />
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse"
        style={{
          animationDelay: '1s',
          transform: `translateX(${Math.cos(lightPosition * 0.02) * 10}px)`
        }}
      />
      
      {/* Additional accent lights for depth */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-neon-yellow/5 rounded-full blur-[100px] animate-pulse delay-500" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-[100px] animate-pulse delay-700" />
      
      {/* Grid pattern overlay with parallax effect */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] transition-transform duration-100"
        style={{
          transform: `translate(${Math.sin(lightPosition * 0.01) * 2}px, ${Math.cos(lightPosition * 0.01) * 2}px)`
        }}
      />
      
      {/* Background monitors/screens with glowing effect */}
      <div className="absolute top-8 left-8 w-32 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-lg border border-primary/30 animate-pulse shadow-[0_0_20px_rgba(75,95,255,0.3)]" />
      <div className="absolute top-8 right-8 w-32 h-20 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 rounded-lg border border-primary/30 animate-pulse shadow-[0_0_20px_rgba(200,100,255,0.3)]" 
        style={{ animationDelay: '0.5s' }}
      />
      <div className="absolute top-32 right-1/4 w-24 h-16 bg-gradient-to-br from-neon-yellow/15 to-neon-blue/15 rounded-lg border border-accent/20 animate-pulse shadow-[0_0_15px_rgba(255,220,100,0.2)]"
        style={{ animationDelay: '0.3s' }}
      />
      
      {/* News desk surface with enhanced gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3">
        {/* Desk gradient with subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card" />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"
          style={{
            transform: `translateX(${Math.sin(lightPosition * 0.03) * 20}%)`,
            transition: 'transform 0.1s linear'
          }}
        />
        
        {/* Desk surface with animated logo */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-card to-transparent border-t border-primary/20">
          {/* HackMarket logo on desk with pulsing effect */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/30 shadow-[0_0_30px_rgba(75,255,100,0.2)]">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(75,255,100,0.8)]" />
            <span className="text-xs font-bold text-primary">HACKMARKET LIVE</span>
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse shadow-[0_0_10px_rgba(255,75,100,0.8)]" />
          </div>
        </div>
        
        {/* Desk side panels with depth */}
        <div className="absolute bottom-0 left-0 w-1/4 h-32 bg-gradient-to-r from-card to-transparent border-r border-primary/10" />
        <div className="absolute bottom-0 right-0 w-1/4 h-32 bg-gradient-to-l from-card to-transparent border-l border-primary/10" />
      </div>
      
      {/* Scene-specific accent lighting with transitions */}
      {scene === 'highlight' && (
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-transparent to-accent/10 animate-pulse" />
      )}
      {scene === 'team' && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 animate-pulse" />
      )}
      {scene === 'market' && (
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-yellow/5 via-transparent to-neon-pink/5 animate-pulse" />
      )}
      
      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/20" />
    </div>
  );
}
