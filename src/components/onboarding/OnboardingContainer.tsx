import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && onNext && !e.shiftKey) {
        e.preventDefault();
        onNext();
      } else if ((e.key === 'Escape' || e.key === 'Backspace') && onBack && currentStep > 0) {
        if (e.key === 'Backspace') {
          const target = e.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            onBack();
          }
        } else {
          e.preventDefault();
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onBack, currentStep]);

  return (
    <div className="min-h-screen onboarding-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Progress Dots */}
      {totalSteps > 1 && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-[hsl(var(--neon-purple))]'
                  : idx < currentStep
                  ? 'w-2 bg-[hsl(var(--neon-purple))]/50'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Keyboard hints */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-sm flex gap-6">
        {currentStep > 0 && (
          <span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd> Back
          </span>
        )}
        {onNext && (
          <span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> Continue
          </span>
        )}
      </div>
    </div>
  );
};
