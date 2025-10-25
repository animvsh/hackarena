import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface BreakingNewsBannerProps {
  text: string;
  teamName: string;
}

export function BreakingNewsBanner({ text, teamName }: BreakingNewsBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    const hideTimer = setTimeout(() => setIsVisible(false), 15000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [text, teamName]);

  return (
    <div
      className={`absolute top-16 left-0 right-0 transition-all duration-700 ease-out z-50 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-destructive/95 backdrop-blur-sm border-b-4 border-destructive-foreground shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Pulsing indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          </div>
          
          {/* Breaking news label */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white uppercase tracking-wider">
              Breaking News
            </span>
            <div className="w-1 h-6 bg-white/40" />
            <span className="text-sm font-bold text-white/90 uppercase">
              {teamName}
            </span>
          </div>
          
          {/* Scrolling text */}
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll-slow">
              <span className="text-base font-semibold text-white whitespace-nowrap">
                {text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
