import { useState } from 'react';
import { OnboardingQuestion } from '../OnboardingQuestion';
import { Users, Trophy, Briefcase, Award } from 'lucide-react';

interface RoleStepProps {
  onContinue: (role: string) => void;
}

const roles = [
  {
    value: 'spectator',
    label: 'Spectator',
    icon: Users,
    description: 'Watch and predict outcomes',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'hacker',
    label: 'Hacker',
    icon: Trophy,
    description: 'Join or create teams',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    value: 'sponsor',
    label: 'Sponsor',
    icon: Briefcase,
    description: 'View analytics',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    value: 'judge',
    label: 'Judge',
    icon: Award,
    description: 'Evaluate projects',
    gradient: 'from-green-500 to-teal-500',
  },
];

export const RoleStep = ({ onContinue }: RoleStepProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelect = (role: string) => {
    setSelectedRole(role);
    setTimeout(() => onContinue(role), 300);
  };

  return (
    <OnboardingQuestion 
      question="How will you participate?"
      subtitle="Choose your role in the arena"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className={`group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10 text-left ${
                selectedRole === role.value
                  ? 'border-white shadow-2xl shadow-white/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{role.label}</h3>
              <p className="text-white/70">{role.description}</p>
            </button>
          );
        })}
      </div>
    </OnboardingQuestion>
  );
};
