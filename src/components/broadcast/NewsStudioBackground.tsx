import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

interface NewsStudioBackgroundProps {
  scene: BroadcastScene;
}

export function NewsStudioBackground({ scene }: NewsStudioBackgroundProps) {
  const [lightPosition, setLightPosition] = useState(50);

  useEffect(() => {
    // Subtle lighting animation for broadcast atmosphere
    const lightInterval = setInterval(() => {
      setLightPosition(prev => {
        const newPos = prev + (Math.random() - 0.5) * 3;
        return Math.max(45, Math.min(55, newPos));
      });
    }, 4000);

    return () => {
      clearInterval(lightInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Professional Broadcast Blue Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#2563eb] via-[#1e40af] to-[#1e3a8a]"
        style={{
          background: `linear-gradient(180deg, 
            hsl(217, 91%, 60%) 0%, 
            hsl(224, 76%, 48%) 50%, 
            hsl(224, 64%, 33%) 100%)`
        }}
      />

      {/* Subtle studio lighting effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${lightPosition}% 40%, 
            rgba(255, 255, 255, 0.15) 0%, 
            transparent 50%)`
        }}
      />

      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />

      {/* Professional studio floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1e3a8a]/40 to-transparent" />

      {/* Scene-specific accent lighting (very subtle) */}
      {scene === 'highlight' && (
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-destructive/10 to-transparent animate-pulse" />
      )}
      
      {scene === 'market' && (
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-primary/10 to-transparent" />
      )}
    </div>
  );
}
