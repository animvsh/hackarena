import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Eye, Code, DollarSign, Scale } from 'lucide-react';

interface Step03RoleProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const roles = [
  {
    value: 'spectator',
    label: 'Spectator',
    icon: Eye,
    description: 'Watch and bet on hackathon teams',
    color: 'neon-blue',
  },
  {
    value: 'hacker',
    label: 'Hacker',
    icon: Code,
    description: 'Build projects and compete in hackathons',
    color: 'neon-purple',
  },
  {
    value: 'sponsor',
    label: 'Sponsor',
    icon: DollarSign,
    description: 'Support teams and discover talent',
    color: 'neon-cyan',
  },
  {
    value: 'judge',
    label: 'Judge',
    icon: Scale,
    description: 'Evaluate projects and provide feedback',
    color: 'neon-pink',
  },
];

export const Step03Role: React.FC<Step03RoleProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <OnboardingStep
      question="Choose your role"
      helper="You can always change this later"
      onNext={value ? onNext : undefined}
      onBack={onBack}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.value;
          
          return (
            <button
              key={role.value}
              onClick={() => onChange(role.value)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? `border-[hsl(var(--${role.color}))] bg-[hsl(var(--${role.color}))]/10`
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isSelected
                  ? `bg-[hsl(var(--${role.color}))]/20`
                  : 'bg-white/10'
              }`}>
                <Icon className={`w-7 h-7 ${
                  isSelected
                    ? `text-[hsl(var(--${role.color}))]`
                    : 'text-white/60'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {role.label}
              </h3>
              <p className="text-sm text-white/60">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </OnboardingStep>
  );
};
