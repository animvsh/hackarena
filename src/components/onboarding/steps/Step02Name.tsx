import React, { useEffect, useRef } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';

interface Step02NameProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step02Name: React.FC<Step02NameProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isValid = value.trim().length >= 2;

  return (
    <OnboardingStep
      question="What's your name?"
      helper="This is how others will see you on HackArena"
      onNext={isValid ? onNext : undefined}
      onBack={onBack}
      nextDisabled={!isValid}
      showBackButton={false}
    >
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your display name"
        className="text-2xl h-16 text-center bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20"
        maxLength={50}
      />
      <p className="text-sm text-white/40 mt-2">
        {value.length}/50 characters
      </p>
    </OnboardingStep>
  );
};
