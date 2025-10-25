import { useState, useEffect } from 'react';

interface LowerThirdBannerProps {
  teamName: string;
  metric: string;
  value: number;
  change: number;
}

export function LowerThirdBanner({ teamName, metric, value, change }: LowerThirdBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setIsVisible(false);
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Hold for 12 seconds then slide out
    const hideTimer = setTimeout(() => setIsVisible(false), 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [teamName, metric, value]);

  const changeColor = change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground';
  const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  return (
    <div
      className={`absolute bottom-8 left-0 transition-all duration-700 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-primary/90 via-primary/80 to-transparent backdrop-blur-md border-t-2 border-l-2 border-primary shadow-2xl">
        <div className="flex items-center px-4 py-2 gap-3 min-w-[400px]">
          {/* Accent bar */}
          <div className="w-1 h-10 bg-primary-foreground rounded-full animate-pulse" />
          
          {/* Team info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-primary-foreground uppercase tracking-wider">
                {teamName}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary-foreground/90">
              {metric}
            </span>
          </div>
          
          {/* Value and change */}
          {value !== 0 && (
            <div className="ml-auto flex items-center gap-2 bg-background/20 px-3 py-1 rounded-full">
              <span className="text-base font-bold text-primary-foreground">
                {value.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${changeColor} flex items-center`}>
                {changeIcon} {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
