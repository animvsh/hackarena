import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Textarea } from '@/components/ui/textarea';

interface Step05BioProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step05Bio: React.FC<Step05BioProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const handleSkip = () => {
    onChange('');
    onNext();
  };

  return (
    <OnboardingStep
      question="Tell us about yourself"
      helper="Share a bit about your background, interests, or what brings you to HackArena"
      onNext={onNext}
      onBack={onBack}
      onSkip={handleSkip}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Full-stack developer passionate about AI and blockchain. Love building products that solve real problems..."
        className="min-h-[150px] text-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20 resize-none"
        maxLength={500}
      />
      <p className="text-sm text-white/40 mt-2 text-right">
        {value.length}/500 characters
      </p>
    </OnboardingStep>
  );
};
