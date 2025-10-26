import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Trophy, Briefcase, Award, Coins } from 'lucide-react';
import { TeamSetup } from '@/components/onboarding/TeamSetup';
import { InviteCodeDisplay } from '@/components/onboarding/InviteCodeDisplay';
import { ProfileImport } from '@/components/onboarding/ProfileImport';
import { ProfileForm } from '@/components/onboarding/ProfileForm';
import { HackathonSelection } from '@/components/onboarding/HackathonSelection';

const roleOptions = [
  { value: 'spectator', label: 'Spectator', icon: Users, description: 'Watch and predict outcomes' },
  { value: 'hacker', label: 'Hacker', icon: Trophy, description: 'Join or create teams' },
  { value: 'sponsor', label: 'Sponsor', icon: Briefcase, description: 'View analytics (requires approval)' },
  { value: 'judge', label: 'Judge', icon: Award, description: 'Evaluate projects (requires approval)' }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('spectator');
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

  const handleRoleSubmit = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: role as any });
      
      // If hacker, go to hackathon selection first
      if (role === 'hacker') {
        setStep(2.3);
      } else {
        setStep(2.5);
      }
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleHackathonSelected = (hackathonId: string | null) => {
    setSelectedHackathonId(hackathonId);
    setStep(2.5);
  };

  const handleProfileImport = (data: any, source: string) => {
    setProfileData({ ...profileData, ...data });
    setProfileSource(source);
    setStep(3); // Go to profile completion
  };

  const handleProfileSubmit = async () => {
    if (!user) return;
    
    try {
      // Only mark onboarding complete if not a hacker (hackers need team setup first)
      const shouldComplete = role !== 'hacker';
      
      await supabase
        .from('users')
        .update({
          username: profileData.username || profile?.username,
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
      
      // If hacker role, go to team setup, otherwise complete
      if (role === 'hacker') {
        setStep(3.5);
      } else {
        setStep(4);
      }
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    // Mark onboarding as complete
    await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', user.id);
    
    toast.success('Welcome to HackCast LIVE! 🎉');
    navigate('/');
  };

  const handleTeamCreated = (createdTeamId: string, code: string) => {
    setTeamId(createdTeamId);
    setInviteCode(code);
    setStep(4);
  };

  const handleTeamJoined = () => {
    setStep(4);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-3xl font-bold text-primary">HackCast LIVE</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-destructive">BROADCASTING</span>
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome! 🚀</CardTitle>
            <CardDescription className="text-lg mt-2">
              The world's first AI-powered hackathon prediction market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Predict team outcomes, earn HackCoins, and experience real-time AI commentary as hackers build amazing projects.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-primary">Live</p>
                  <p className="text-sm text-muted-foreground">Markets</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-primary">AI</p>
                  <p className="text-sm text-muted-foreground">Commentary</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-primary">Real</p>
                  <p className="text-sm text-muted-foreground">Rewards</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>Select how you'd like to participate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={role} onValueChange={setRole}>
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-3 cursor-pointer flex-1">
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleRoleSubmit} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2.3 && role === 'hacker') {
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

  if (step === 2.5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <ProfileImport
            onComplete={handleProfileImport}
          />
        </div>
      </div>
    );
  }

  if (step === 3.5 && role === 'hacker' && user) {
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

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <ProfileForm
            initialData={profileData}
            onSubmit={handleProfileSubmit}
            onBack={() => setStep(2.5)}
          />
        </div>
      </div>
    );
  }

  if (step === 4) {
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
    
    // Completion screen for non-team creators
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Coins className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">You're All Set! 🎉</CardTitle>
            <CardDescription className="text-lg mt-2">
              {role === 'hacker' 
                ? 'Your join request has been sent. You\'ll be notified when approved!'
                : 'Start with 1,000 HackCoins'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 rounded-lg p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">1,000 HC</p>
              <p className="text-muted-foreground">Your starting balance</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">How to earn more:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Make accurate predictions on team outcomes</li>
                <li>✓ Bet on trending teams early</li>
                <li>✓ Win big in prediction markets</li>
              </ul>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Start Exploring
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
