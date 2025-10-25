import type { BroadcastScene } from '@/types/broadcast';

interface NewsStudioBackgroundProps {
  scene: BroadcastScene;
}

export function NewsStudioBackground({ scene }: NewsStudioBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Studio backdrop with lighting gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-card to-card" />
      
      {/* Animated studio lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Background monitors/screens */}
      <div className="absolute top-8 left-8 w-32 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-lg border border-primary/30 animate-pulse" />
      <div className="absolute top-8 right-8 w-32 h-20 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 rounded-lg border border-primary/30 animate-pulse delay-500" />
      
      {/* News desk surface */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3">
        {/* Desk gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card" />
        
        {/* Desk surface with logo */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-card to-transparent border-t border-primary/20">
          {/* HackMarket logo on desk */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/30">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold text-primary">HACKMARKET LIVE</span>
          </div>
        </div>
        
        {/* Desk side panels */}
        <div className="absolute bottom-0 left-0 w-1/4 h-32 bg-gradient-to-r from-card to-transparent border-r border-primary/10" />
        <div className="absolute bottom-0 right-0 w-1/4 h-32 bg-gradient-to-l from-card to-transparent border-l border-primary/10" />
      </div>
      
      {/* Scene-specific accent lighting */}
      {scene === 'highlight' && (
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-transparent to-accent/5 animate-pulse" />
      )}
    </div>
  );
}
