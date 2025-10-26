import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  progress?: number;
  showProgress?: boolean;
}

export const OnboardingLayout = ({ children, onBack, progress = 0, showProgress = true }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-purple-pink relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-neon-purple/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Back button */}
        {onBack && (
          <div className="absolute top-8 left-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Progress dots */}
        {showProgress && (
          <div className="absolute top-8 right-8 flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= progress ? 'bg-white w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="w-full max-w-2xl animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};
