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
      className={`absolute bottom-20 left-0 right-0 h-24 transition-transform duration-700 ease-out ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full bg-gradient-to-r from-card via-card/95 to-transparent border-t border-b border-primary/20">
        <div className="flex items-center h-full px-8 gap-6">
          {/* Team name */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-16 bg-primary rounded-full" />
            <h3 className="text-2xl font-bold text-foreground uppercase tracking-wider">
              {teamName}
            </h3>
          </div>

          {/* Metric info */}
          <div className="flex items-center gap-4 ml-8">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">{metric}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
            <div className={`flex items-center gap-1 text-xl font-semibold ${changeColor}`}>
              <span>{changeIcon}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          </div>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
