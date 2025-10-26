import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Users, UserPlus } from 'lucide-react';

interface Step08TeamChoiceProps {
  value: 'create' | 'join' | '';
  onChange: (value: 'create' | 'join' | '') => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step08TeamChoice: React.FC<Step08TeamChoiceProps> = ({
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
      question="Want to join a team?"
      helper="Teams collaborate on hackathon projects together"
      onNext={value ? onNext : undefined}
      onBack={onBack}
      onSkip={handleSkip}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => onChange('create')}
          className={`p-8 rounded-2xl border-2 transition-all ${
            value === 'create'
              ? 'border-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          }`}
        >
          <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
            value === 'create'
              ? 'bg-[hsl(var(--neon-purple))]/20'
              : 'bg-white/10'
          }`}>
            <Users className={`w-8 h-8 ${
              value === 'create'
                ? 'text-[hsl(var(--neon-purple))]'
                : 'text-white/60'
            }`} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Create a Team
          </h3>
          <p className="text-sm text-white/60">
            Start fresh and invite others to join
          </p>
        </button>

        <button
          onClick={() => onChange('join')}
          className={`p-8 rounded-2xl border-2 transition-all ${
            value === 'join'
              ? 'border-[hsl(var(--neon-blue))] bg-[hsl(var(--neon-blue))]/10'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          }`}
        >
          <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
            value === 'join'
              ? 'bg-[hsl(var(--neon-blue))]/20'
              : 'bg-white/10'
          }`}>
            <UserPlus className={`w-8 h-8 ${
              value === 'join'
                ? 'text-[hsl(var(--neon-blue))]'
                : 'text-white/60'
            }`} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Join a Team
          </h3>
          <p className="text-sm text-white/60">
            Have an invite code? Join existing team
          </p>
        </button>
      </div>
    </OnboardingStep>
  );
};
