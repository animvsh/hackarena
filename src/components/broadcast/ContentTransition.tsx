import { useEffect, useState } from 'react';

interface ContentTransitionProps {
  content: string;
  duration?: number;
  onComplete?: () => void;
}

export function ContentTransition({ content, duration = 10000, onComplete }: ContentTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fade in
    setIsVisible(true);
    setProgress(0);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    // Fade out and complete
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimer);
    };
  }, [content, duration, onComplete]);

  return (
    <div
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="relative">
        {/* Progress indicator */}
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="pt-2">
          {content}
        </div>
      </div>
    </div>
  );
}
