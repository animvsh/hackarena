import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Step09TeamCreateProps {
  userId: string;
  hackathonId: string | null;
  onTeamCreated: (teamId: string, inviteCode: string) => void;
  onBack: () => void;
}

export const Step09TeamCreate: React.FC<Step09TeamCreateProps> = ({
  userId,
  hackathonId,
  onTeamCreated,
  onBack,
}) => {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
  });

  const subSteps = [
    {
      question: "What's your team name?",
      helper: "Choose something memorable and unique",
      field: 'name' as const,
      placeholder: 'e.g., Code Wizards',
      type: 'input' as const,
    },
    {
      question: "Add a tagline",
      helper: "A short, catchy description of your team",
      field: 'tagline' as const,
      placeholder: 'e.g., Building the future, one line at a time',
      type: 'input' as const,
    },
    {
      question: "Describe your project",
      helper: "What are you building? What problem does it solve?",
      field: 'description' as const,
      placeholder: 'Tell us about your amazing project...',
      type: 'textarea' as const,
    },
  ];

  const currentStep = subSteps[currentSubStep];
  const isLastSubStep = currentSubStep === subSteps.length - 1;
  const isValid = formData[currentStep.field].trim().length >= 3;

  const handleNext = async () => {
    if (isLastSubStep) {
      // Create team
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-team', {
          body: {
            teamName: formData.name,
            tagline: formData.tagline,
            projectDescription: formData.description,
            hackathonId: hackathonId,
            userId: userId,
          },
        });

        if (error) throw error;

        if (data?.team_id && data?.invite_code) {
          onTeamCreated(data.team_id, data.invite_code);
        }
      } catch (error: any) {
        console.error('Error creating team:', error);
        toast({
          title: 'Error creating team',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  const handleBack = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <OnboardingStep
      question={currentStep.question}
      helper={currentStep.helper}
      onNext={isValid && !loading ? handleNext : undefined}
      onBack={handleBack}
      nextDisabled={!isValid || loading}
      nextLabel={loading ? 'Creating...' : isLastSubStep ? 'Create Team' : 'Continue'}
    >
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-[hsl(var(--neon-purple))] animate-spin" />
        </div>
      )}
      
      {!loading && currentStep.type === 'input' && (
        <Input
          autoFocus
          value={formData[currentStep.field]}
          onChange={(e) =>
            setFormData({ ...formData, [currentStep.field]: e.target.value })
          }
          placeholder={currentStep.placeholder}
          className="text-xl h-14 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20 max-w-xl mx-auto"
        />
      )}

      {!loading && currentStep.type === 'textarea' && (
        <Textarea
          autoFocus
          value={formData[currentStep.field]}
          onChange={(e) =>
            setFormData({ ...formData, [currentStep.field]: e.target.value })
          }
          placeholder={currentStep.placeholder}
          className="min-h-[150px] text-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--neon-purple))] focus:ring-[hsl(var(--neon-purple))]/20 resize-none max-w-xl mx-auto"
        />
      )}
    </OnboardingStep>
  );
};
