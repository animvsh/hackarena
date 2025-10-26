import { useState, useEffect, useRef } from 'react';
import { OnboardingQuestion } from '../OnboardingQuestion';
import { Button } from '@/components/ui/button';

interface NameStepProps {
  initialName?: string;
  onContinue: (name: string) => void;
}

export const NameStep = ({ initialName = '', onContinue }: NameStepProps) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onContinue(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      onContinue(name.trim());
    }
  };

  return (
    <OnboardingQuestion 
      question="What's your name?"
      subtitle="This is how others will see you on HackArena"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your name..."
          className="w-full text-4xl md:text-5xl font-bold text-center bg-transparent border-0 border-b-4 border-white/30 focus:border-white text-white placeholder:text-white/30 outline-none py-4 transition-colors"
          maxLength={50}
        />
        
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={!name.trim()}
            className="text-lg px-12 py-6 h-auto bg-white text-purple-600 hover:bg-white/90 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
        
        <p className="text-white/50 text-sm">Press Enter ↵</p>
      </form>
    </OnboardingQuestion>
  );
};
