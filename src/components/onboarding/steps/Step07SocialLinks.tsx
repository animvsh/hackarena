import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Linkedin, Github, Globe } from 'lucide-react';

interface Step07SocialLinksProps {
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  onChange: (field: 'linkedin_url' | 'github_url' | 'portfolio_url', value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step07SocialLinks: React.FC<Step07SocialLinksProps> = ({
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  onChange,
  onNext,
  onBack,
}) => {
  const handleSkip = () => {
    onChange('linkedin_url', '');
    onChange('github_url', '');
    onChange('portfolio_url', '');
    onNext();
  };

  return (
    <OnboardingStep
      question="Connect your profiles"
      helper="Help others find and connect with you (all optional)"
      onNext={onNext}
      onBack={onBack}
      onSkip={handleSkip}
    >
      <div className="space-y-4 max-w-md mx-auto">
        {/* LinkedIn */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80">
            <Linkedin className="w-5 h-5 text-[hsl(var(--neon-blue))]" />
            <label className="text-sm">LinkedIn</label>
          </div>
          <Input
            type="url"
            value={linkedinUrl}
            onChange={(e) => onChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-blue))] focus:ring-[hsl(var(--neon-blue))]/20"
          />
        </div>

        {/* GitHub */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80">
            <Github className="w-5 h-5 text-[hsl(var(--neon-purple))]" />
            <label className="text-sm">GitHub</label>
          </div>
          <Input
            type="url"
            value={githubUrl}
            onChange={(e) => onChange('github_url', e.target.value)}
            placeholder="https://github.com/username"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20"
          />
        </div>

        {/* Portfolio */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80">
            <Globe className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
            <label className="text-sm">Portfolio / Website</label>
          </div>
          <Input
            type="url"
            value={portfolioUrl}
            onChange={(e) => onChange('portfolio_url', e.target.value)}
            placeholder="https://yoursite.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-cyan))] focus:ring-[hsl(var(--neon-cyan))]/20"
          />
        </div>
      </div>
    </OnboardingStep>
  );
};
