import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';
import studioBg from '@/assets/broadcast-studio-bg.jpg';

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
      {/* Professional studio background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${studioBg})`,
          filter: 'blur(3px) brightness(0.7)',
        }}
      />
      
      {/* Studio lighting overlay with movement */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at ${lightPosition}% 35%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
        }}
      />
      
      {/* Key light from front-left */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)'
        }}
      />
      
      {/* Fill light from front-right */}
      <div className="absolute top-0 right-0 w-full h-full opacity-15"
        style={{
          background: 'radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)'
        }}
      />

      {/* Professional studio floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Depth vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)'
      }} />

      {/* Scene-specific accent lighting */}
      {scene === 'highlight' && (
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent animate-pulse" />
      )}
      
      {scene === 'market' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
      )}
      
      {/* Subtle film grain for broadcast realism */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuNSIvPjwvc3ZnPg==')]" />
    </div>
  );
}
