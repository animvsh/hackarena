import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { NameStep } from '@/components/onboarding/steps/NameStep';
import { RoleStep } from '@/components/onboarding/steps/RoleStep';
import { CompletionStep } from '@/components/onboarding/steps/CompletionStep';
import { TeamSetup } from '@/components/onboarding/TeamSetup';
import { InviteCodeDisplay } from '@/components/onboarding/InviteCodeDisplay';
import { ProfileImport } from '@/components/onboarding/ProfileImport';
import { ProfileForm } from '@/components/onboarding/ProfileForm';
import { HackathonSelection } from '@/components/onboarding/HackathonSelection';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('spectator');
  const [userName, setUserName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>({
    username: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });
  const [profileSource, setProfileSource] = useState('manual');
  const [teamId, setTeamId] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    setProfileData({ ...profileData, username: name });
    setStep(2);
  };

  const handleRoleSubmit = async (selectedRole: string) => {
    if (!user) return;
    
    setRole(selectedRole);
    
    try {
      await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: selectedRole as any });
      
      if (selectedRole === 'hacker') {
        setStep(3); // hackathon selection
      } else {
        setStep(4); // profile import
      }
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleHackathonSelected = (hackathonId: string | null) => {
    setSelectedHackathonId(hackathonId);
    setStep(4); // profile import
  };

  const handleProfileImport = (data: any, source: string) => {
    setProfileData({ ...profileData, ...data });
    setProfileSource(source);
    setStep(5); // profile form
  };

  const handleProfileSubmit = async () => {
    if (!user) return;
    
    try {
      const shouldComplete = role !== 'hacker';
      
      await supabase
        .from('users')
        .update({
          username: profileData.username || userName,
          bio: profileData.bio,
          skills: profileData.skills,
          experience: profileData.experience,
          education: profileData.education,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          portfolio_url: profileData.portfolio_url,
          profile_generated_by: profileSource,
          onboarding_completed: shouldComplete,
        })
        .eq('id', user.id);
      
      if (role === 'hacker') {
        setStep(6); // team setup
      } else {
        setStep(7); // completion
      }
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', user.id);
    
    toast.success('Welcome to HackArena! 🎉');
    navigate('/');
  };

  const handleTeamCreated = (createdTeamId: string, code: string) => {
    setTeamId(createdTeamId);
    setInviteCode(code);
    setStep(7);
  };

  const handleTeamJoined = () => {
    setStep(7);
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <OnboardingLayout showProgress={false}>
        <WelcomeStep onContinue={() => setStep(1)} />
      </OnboardingLayout>
    );
  }

  // Step 1: Name
  if (step === 1) {
    return (
      <OnboardingLayout onBack={() => setStep(0)} progress={0}>
        <NameStep initialName={userName} onContinue={handleNameSubmit} />
      </OnboardingLayout>
    );
  }

  // Step 2: Role
  if (step === 2) {
    return (
      <OnboardingLayout onBack={() => setStep(1)} progress={1}>
        <RoleStep onContinue={handleRoleSubmit} />
      </OnboardingLayout>
    );
  }

  // Step 3: Hackathon (only for hackers)
  if (step === 3 && role === 'hacker') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <HackathonSelection
            onSelected={handleHackathonSelected}
            onBack={() => setStep(2)}
          />
        </div>
      </div>
    );
  }

  // Step 4: Profile Import
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <ProfileImport onComplete={handleProfileImport} />
        </div>
      </div>
    );
  }

  // Step 5: Profile Form
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <ProfileForm
            initialData={profileData}
            onSubmit={handleProfileSubmit}
            onBack={() => setStep(4)}
          />
        </div>
      </div>
    );
  }

  // Step 6: Team Setup (only for hackers)
  if (step === 6 && role === 'hacker' && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <TeamSetup
            userId={user.id}
            hackathonId={selectedHackathonId}
            onTeamCreated={handleTeamCreated}
            onTeamJoined={handleTeamJoined}
          />
        </div>
      </div>
    );
  }

  // Step 7: Completion
  if (step === 7) {
    if (inviteCode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl">
            <InviteCodeDisplay
              inviteCode={inviteCode}
              teamName={profileData.username || 'Your Team'}
              onContinue={handleComplete}
            />
          </div>
        </div>
      );
    }
    
    return (
      <OnboardingLayout showProgress={false}>
        <CompletionStep onComplete={handleComplete} userName={userName || 'there'} />
      </OnboardingLayout>
    );
  }

  return null;
}
