import { useState, useEffect } from 'react';
import { useBroadcastPause } from '@/contexts/BroadcastPauseContext';

interface LowerThirdBannerProps {
  teamName: string;
  metric: string;
  value: number;
  change: number;
}

export function LowerThirdBanner({ teamName, metric, value, change }: LowerThirdBannerProps) {
  const { isPaused } = useBroadcastPause();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPaused) {
      console.log('[LowerThirdBanner] Banner animation paused');
      return;
    }

    // Slide in animation
    setIsVisible(false);
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Hold for 12 seconds then slide out
    const hideTimer = setTimeout(() => setIsVisible(false), 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [teamName, metric, value, isPaused]);

  const changeColor = change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground';
  const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  return (
    <div
      className={`absolute bottom-10 left-0 transition-all duration-700 ease-out z-30 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-primary/95 via-primary/85 to-transparent backdrop-blur-md border-t-2 border-l-2 border-primary/60 shadow-2xl rounded-r-lg">
        <div className="flex items-center px-5 py-3 gap-4 min-w-[450px]">
          {/* Animated accent bar */}
          <div className="w-1.5 h-12 bg-primary-foreground rounded-full animate-pulse shadow-lg" />
          
          {/* Team info with enhanced typography */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-primary-foreground uppercase tracking-wider">
                {teamName}
              </span>
            </div>
            <span className="text-base font-semibold text-primary-foreground/95 leading-tight">
              {metric}
            </span>
          </div>
          
          {/* Value and change with better visual hierarchy */}
          {value !== 0 && (
            <div className="ml-auto flex items-center gap-3 bg-background/30 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-lg font-bold text-primary-foreground">
                {value.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${changeColor} flex items-center gap-0.5`}>
                {changeIcon} {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
