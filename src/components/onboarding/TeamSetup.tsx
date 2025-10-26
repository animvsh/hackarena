import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, UserPlus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamSetupProps {
  userId: string;
  hackathonId?: string | null;
  onTeamCreated: (teamId: string, inviteCode: string) => void;
  onTeamJoined: (teamId: string) => void;
}

interface AIRecommendation {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

interface AIAnalysis {
  company_type: string;
  business_model: string;
  industry: string;
  recommended_integrations: AIRecommendation[];
  key_metrics: string[];
  reasoning: string;
}

export const TeamSetup = ({ userId, hackathonId, onTeamCreated, onTeamJoined }: TeamSetupProps) => {
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  // Create team form state
  const [teamName, setTeamName] = useState('');
  const [tagline, setTagline] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [industryTags, setIndustryTags] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [stage, setStage] = useState('building');

  // Join team form state
  const [inviteCode, setInviteCode] = useState('');

  const industryOptions = ['B2B', 'B2C', 'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'Developer Tools', 'Marketplace'];
  const techOptions = ['React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'MongoDB', 'AWS', 'Firebase'];

  const handleAnalyze = async () => {
    if (!teamName || !projectDescription) {
      toast.error('Please provide team name and project description');
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-team-profile', {
        body: {
          teamName,
          projectDescription,
          industryTags,
          stage,
          teamSize: 4,
        },
      });

      if (error) throw error;
      
      setAiAnalysis(data);
      toast.success('AI analysis complete! Here are your recommended integrations.');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze team profile. You can still create the team.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || !projectDescription) {
      toast.error('Please provide team name and project description');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-team', {
        body: {
          teamName,
          tagline,
          projectDescription,
          industryTags,
          techStack,
          stage,
          teamSize: 4,
          userId,
          hackathonId,
          aiAnalysis,
        },
      });

      if (error) throw error;

      toast.success(`Team "${teamName}" created successfully!`);
      onTeamCreated(data.team.id, data.inviteCode);
    } catch (error: any) {
      console.error('Team creation error:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('join-team', {
        body: {
          inviteCode: inviteCode.trim(),
          userId,
        },
      });

      if (error) throw error;

      toast.success(`Join request sent to ${data.teamName}! Waiting for approval.`);
      onTeamJoined(data.requestId);
    } catch (error: any) {
      console.error('Join team error:', error);
      toast.error(error.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500';
    }
  };

  if (mode === 'choice') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Join or Create a Team</h2>
          <p className="text-muted-foreground">
            Work together with your team to track progress and compete
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode('create')}>
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Create New Team</CardTitle>
              <CardDescription>
                Start a new team with AI-powered integration recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Team</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode('join')}>
            <CardHeader>
              <UserPlus className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Join Existing Team</CardTitle>
              <CardDescription>
                Use an invite code to join your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Join Team</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Join a Team</h2>
          <p className="text-muted-foreground">
            Enter your team's invite code to request access
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Invite Code</CardTitle>
            <CardDescription>
              Ask your team owner for the invite code (looks like: hc_live_...)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="hc_live_a1b2c3d4..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleJoinTeam} disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request to Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Create Your Team</h2>
        <p className="text-muted-foreground">
          Tell us about your project and get AI-powered recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="Awesome Startup"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="Building the future of..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're building, your target users, and your goals..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Industry Tags</Label>
            <div className="flex flex-wrap gap-2">
              {industryOptions.map(tag => (
                <Badge
                  key={tag}
                  variant={industryTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag, setIndustryTags)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex flex-wrap gap-2">
              {techOptions.map(tag => (
                <Badge
                  key={tag}
                  variant={techStack.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag, setTechStack)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {!aiAnalysis && (
            <Button onClick={handleAnalyze} disabled={analyzing} className="w-full" variant="secondary">
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          )}

          {aiAnalysis && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>{aiAnalysis.reasoning}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Recommended Integrations:</p>
                  <div className="space-y-2">
                    {aiAnalysis.recommended_integrations.map((integration, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background">
                        <Badge className={getPriorityColor(integration.priority)} variant="outline">
                          {integration.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{integration.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{integration.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Key Metrics to Track:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.key_metrics.map((metric, idx) => (
                      <Badge key={idx} variant="secondary">{metric}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleCreateTeam} disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
