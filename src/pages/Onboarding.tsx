import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { Step01Welcome } from "@/components/onboarding/steps/Step01Welcome";
import { Step02Name } from "@/components/onboarding/steps/Step02Name";
import { Step03Role } from "@/components/onboarding/steps/Step03Role";
import { Step04Hackathon } from "@/components/onboarding/steps/Step04Hackathon";
import { Step05Bio } from "@/components/onboarding/steps/Step05Bio";
import { Step06Skills } from "@/components/onboarding/steps/Step06Skills";
import { Step07SocialLinks } from "@/components/onboarding/steps/Step07SocialLinks";
import { Step08TeamChoice } from "@/components/onboarding/steps/Step08TeamChoice";
import { Step09TeamCreate } from "@/components/onboarding/steps/Step09TeamCreate";
import { Step10TeamJoin } from "@/components/onboarding/steps/Step10TeamJoin";
import { Step11Completion } from "@/components/onboarding/steps/Step11Completion";

interface FormData {
  name: string;
  role: 'spectator' | 'hacker' | 'sponsor' | 'judge';
  hackathonId: string | null;
  bio: string;
  skills: string[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  teamChoice: 'create' | 'join' | '';
  teamId: string | null;
  inviteCode: string | null;
  teamName: string | null;
}

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'spectator',
    hackathonId: null,
    bio: '',
    skills: [],
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    teamChoice: '',
    teamId: null,
    inviteCode: null,
    teamName: null,
  });

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const { step, data, timestamp } = JSON.parse(saved);
        // Resume if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          setCurrentStep(step);
          setFormData(data);
        } else {
          localStorage.removeItem('onboarding_progress');
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem('onboarding_progress', JSON.stringify({
        step: currentStep,
        data: formData,
        timestamp: Date.now(),
      }));
    }
  }, [currentStep, formData]);

  const updateFormData = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Update users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.name,
          bio: formData.bio,
          skills: formData.skills,
          linkedin_url: formData.linkedin_url || null,
          github_url: formData.github_url || null,
          portfolio_url: formData.portfolio_url || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Insert user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: formData.role });
      
      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Role insert error:', roleError);
      }

      // Clear saved progress
      localStorage.removeItem('onboarding_progress');

      // Navigate to home
      navigate('/');
      
      toast({
        title: 'Welcome to HackArena!',
        description: `You've received 1,000 HackCoins to get started.`,
      });
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error saving profile',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Calculate total steps dynamically
  const getTotalSteps = () => {
    let total = 8; // Welcome, Name, Role, Bio, Skills, Social Links, Completion
    
    if (formData.role === 'hacker') {
      total += 1; // Hackathon selection
      if (formData.teamChoice === 'create') total += 1; // Team creation
      if (formData.teamChoice === 'join') total += 1; // Team join
      if (formData.teamChoice !== '') total += 1; // Team choice screen
    }
    
    return total;
  };

  // Render current step
  const renderStep = () => {
    // Step 0: Welcome
    if (currentStep === 0) {
      return <Step01Welcome onStart={handleNext} />;
    }

    // Step 1: Name
    if (currentStep === 1) {
      return (
        <Step02Name
          value={formData.name}
          onChange={(value) => updateFormData('name', value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 2: Role
    if (currentStep === 2) {
      return (
        <Step03Role
          value={formData.role}
          onChange={(value) => updateFormData('role', value as any)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 3: Hackathon (conditional - hackers only)
    if (currentStep === 3 && formData.role === 'hacker') {
      return (
        <Step04Hackathon
          value={formData.hackathonId}
          onChange={(value) => updateFormData('hackathonId', value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Adjust step index for non-hackers
    const adjustedStep = formData.role === 'hacker' ? currentStep : currentStep + 1;

    // Step 4: Bio
    if (adjustedStep === 4) {
      return (
        <Step05Bio
          value={formData.bio}
          onChange={(value) => updateFormData('bio', value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 5: Skills
    if (adjustedStep === 5) {
      return (
        <Step06Skills
          value={formData.skills}
          onChange={(value) => updateFormData('skills', value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 6: Social Links
    if (adjustedStep === 6) {
      return (
        <Step07SocialLinks
          linkedinUrl={formData.linkedin_url}
          githubUrl={formData.github_url}
          portfolioUrl={formData.portfolio_url}
          onChange={(field, value) => updateFormData(field, value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 7: Team Choice (conditional - hackers only)
    if (adjustedStep === 7 && formData.role === 'hacker') {
      return (
        <Step08TeamChoice
          value={formData.teamChoice}
          onChange={(value) => updateFormData('teamChoice', value)}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }

    // Step 8: Team Create (conditional)
    if (adjustedStep === 8 && formData.role === 'hacker' && formData.teamChoice === 'create') {
      return (
        <Step09TeamCreate
          userId={user?.id || ''}
          hackathonId={formData.hackathonId}
          onTeamCreated={(teamId, inviteCode) => {
            updateFormData('teamId', teamId);
            updateFormData('inviteCode', inviteCode);
            handleNext();
          }}
          onBack={handleBack}
        />
      );
    }

    // Step 8: Team Join (conditional)
    if (adjustedStep === 8 && formData.role === 'hacker' && formData.teamChoice === 'join') {
      return (
        <Step10TeamJoin
          userId={user?.id || ''}
          onTeamJoined={(teamId) => {
            updateFormData('teamId', teamId);
            handleNext();
          }}
          onBack={handleBack}
        />
      );
    }

    // Final Step: Completion
    return (
      <Step11Completion
        userName={formData.name}
        inviteCode={formData.inviteCode || undefined}
        teamName={formData.teamName || undefined}
        onComplete={handleComplete}
      />
    );
  };

  return (
    <OnboardingContainer
      currentStep={currentStep}
      totalSteps={getTotalSteps()}
      onNext={handleNext}
      onBack={handleBack}
    >
      {renderStep()}
    </OnboardingContainer>
  );
};

export default Onboarding;
