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
      className={`absolute bottom-6 left-0 right-0 h-8 transition-transform duration-700 ease-out ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full bg-card/80 backdrop-blur-sm border-t border-primary/20">
        <div className="flex items-center h-full px-3 gap-2">
          {/* Team name and metric in single line */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              {teamName}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-foreground truncate">
              {metric}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
