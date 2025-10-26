import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingStepProps {
  question: string;
  helper?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBackButton?: boolean;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  question,
  helper,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBackButton = true,
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Question */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {question}
        </h1>
        {helper && (
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            {helper}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="w-full">
        {children}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 w-full justify-center">
        {showBackButton && onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            className="text-white/60 hover:text-white"
          >
            Skip for now
          </Button>
        )}
        
        {onNext && (
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            size="lg"
            className="gap-2 min-w-[140px]"
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
