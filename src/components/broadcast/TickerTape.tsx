import { useState, useEffect } from 'react';
import type { TickerItem } from '@/types/broadcast';

export function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([
    { id: '1', text: 'TechCorp: 47 commits', type: 'stat' },
    { id: '2', text: 'StartupX: 3 deals closed', type: 'achievement' },
    { id: '3', text: 'CodeNinjas: 3.2x odds', type: 'market' },
    { id: '4', text: 'TeamAI: 5 meetings today', type: 'stat' },
    { id: '5', text: 'InnovateCo: Production deploy', type: 'achievement' },
  ]);

  // In a real implementation, this would subscribe to live data
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate items for demo purposes
      setItems(prev => [...prev.slice(1), prev[0]]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/90 border-t border-primary/20 overflow-hidden">
      <div className="flex items-center h-full">
        {/* Static LIVE indicator */}
        <div className="flex items-center gap-2 px-6 bg-destructive/20 h-full border-r border-primary/20">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <span className="text-xs font-bold text-foreground uppercase tracking-widest">LIVE</span>
        </div>

        {/* Scrolling ticker content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-scroll flex gap-12">
            {[...items, ...items, ...items].map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-primary font-bold">●</span>
                <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
