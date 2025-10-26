import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Step06SkillsProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const suggestedSkills = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AI/ML',
  'Blockchain', 'Mobile Dev', 'UI/UX', 'DevOps', 'Data Science',
];

export const Step06Skills: React.FC<Step06SkillsProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const [input, setInput] = useState('');

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addSkill(input);
    }
  };

  const handleSkip = () => {
    onChange([]);
    onNext();
  };

  return (
    <OnboardingStep
      question="What are your skills?"
      helper="Add skills to help teams and sponsors discover you"
      onNext={onNext}
      onBack={onBack}
      onSkip={handleSkip}
    >
      <div className="space-y-4">
        {/* Input */}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className="text-lg h-14 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20"
        />

        {/* Selected Skills */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            {value.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-sm px-3 py-1 bg-[hsl(var(--neon-purple))]/20 border border-[hsl(var(--neon-purple))]/30 text-white hover:bg-[hsl(var(--neon-purple))]/30"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-[hsl(var(--neon-purple))]"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggested Skills */}
        <div className="space-y-2">
          <p className="text-sm text-white/60">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter((s) => !value.includes(s))
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
};
