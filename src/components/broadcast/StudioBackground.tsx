import type { BroadcastScene } from '@/types/broadcast';

interface StudioBackgroundProps {
  scene: BroadcastScene;
}

export function StudioBackground({ scene }: StudioBackgroundProps) {
  const getBackgroundStyle = () => {
    const baseStyle = "absolute inset-0 transition-opacity duration-2000";
    
    switch (scene) {
      case 'anchor':
        return `${baseStyle} bg-gradient-to-br from-background via-card to-background`;
      case 'team':
        return `${baseStyle} bg-gradient-to-tr from-card via-background to-muted`;
      case 'market':
        return `${baseStyle} bg-gradient-to-bl from-background via-muted to-card`;
      case 'stats':
        return `${baseStyle} bg-gradient-to-tl from-muted via-card to-background`;
      case 'highlight':
        return `${baseStyle} bg-gradient-to-r from-background via-accent/10 to-background`;
      default:
        return `${baseStyle} bg-background`;
    }
  };

  return (
    <div className={getBackgroundStyle()}>
      {/* Grid overlay for tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Ambient glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse delay-1000" />
    </div>
  );
}
