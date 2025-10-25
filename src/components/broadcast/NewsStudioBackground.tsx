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
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-broadcast-blue to-broadcast-blue-dark">
      {/* Subtle studio lighting effect */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at ${lightPosition}% 35%, rgba(255,255,255,0.2) 0%, transparent 60%)`
        }}
      />

      {/* Subtle vignette for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)'
      }} />

      {/* Professional studio floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/15 to-transparent" />

      {/* Scene-specific accent lighting (very subtle) */}
      {scene === 'highlight' && (
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/8 to-transparent animate-pulse" />
      )}
      
      {scene === 'market' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/8 to-transparent" />
      )}
    </div>
  );
}
