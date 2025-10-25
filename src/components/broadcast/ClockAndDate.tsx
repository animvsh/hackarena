import { useState, useEffect } from 'react';

export function ClockAndDate() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="absolute top-4 left-4 z-40">
      <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-lg shadow-lg px-3 py-2">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 bg-destructive/20 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs font-black text-destructive uppercase tracking-wide">
              Live
            </span>
          </div>
        </div>
        
        {/* Time */}
        <div className="text-lg font-bold text-foreground tabular-nums">
          {formatTime(time)}
        </div>
        
        {/* Date */}
        <div className="text-xs text-muted-foreground">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
}
