import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Trophy,
  Users,
  Plus,
  Calendar,
  MapPin,
  Copy,
  ExternalLink,
  Loader2,
  UserPlus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { GitHubRepoInput } from './GitHubRepoInput';
import { GitHubConnectButton } from './GitHubConnectButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  total_participants: number;
}

interface Team {
  id: string;
  name: string;
  tagline: string | null;
  github_repo: string | null;
  hackathon_id: string | null;
  owner_id: string;
  invite_code: string;
  hackathons: {
    name: string;
    status: string;
  } | null;
}

interface TeamMember {
  team_id: string;
  user_id: string;
  role: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
}

interface GitHubProfile {
  github_verified?: boolean;
  github_username?: string | null;
  last_github_sync?: string | null;
}

interface HackathonParticipationProps {
  userId: string;
}

export function HackathonParticipation({ userId }: HackathonParticipationProps) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [modalStep, setModalStep] = useState<'hackathon' | 'team-action' | 'create' | 'join'>('hackathon');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [creating, setCreating] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState('');
  const [tagline, setTagline] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');

  // Join team form
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  // GitHub integration
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepoUrl, setSelectedRepoUrl] = useState('');

  useEffect(() => {
    fetchData();
    fetchGitHubProfile();
  }, [userId]);

  const fetchGitHubProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('github_verified, github_username, last_github_sync')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setGithubProfile(data);
    } catch (error) {
      console.error('Error fetching GitHub profile:', error);
    }
  };

  const fetchRepositories = async () => {
    setLoadingRepos(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-github-repos', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Handle authentication errors
      if (data?.needsAuth || data?.code === 'TOKEN_REVOKED' || data?.code === 'GITHUB_NOT_CONNECTED') {
        await fetchGitHubProfile();
        toast.error(data.error || 'Please reconnect your GitHub account');
        return;
      }

      // Handle rate limiting
      if (data?.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error('GitHub API rate limit exceeded. Please try again later.');
        return;
      }

      // Handle other errors
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.repos) {
        setRepos(data.repos);
      }
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      toast.error(error.message || 'Failed to load repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active/upcoming hackathons
      const { data: hackathonsData, error: hackathonsError } = await supabase
        .from('hackathons')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: false });

      if (hackathonsError) throw hackathonsError;
      setHackathons(hackathonsData || []);

      // Fetch user's teams
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select('team_id, user_id, role')
        .eq('user_id', userId);

      if (teamMembersError) throw teamMembersError;

      if (teamMembersData && teamMembersData.length > 0) {
        const teamIds = teamMembersData.map((tm: TeamMember) => tm.team_id);

        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*, hackathons(name, status)')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        setUserTeams(teamsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load hackathon data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHackathonClick = () => {
    setShowJoinModal(true);
    setModalStep('hackathon');
    setSelectedHackathon(null);
  };

  const handleHackathonSelect = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setModalStep('team-action');
  };

  // Fetch repositories when user reaches create team step
  useEffect(() => {
    if (modalStep === 'create' && githubProfile?.github_verified && repos.length === 0) {
      fetchRepositories();
    }
  }, [modalStep, githubProfile?.github_verified]);

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !projectDescription.trim()) {
      toast.error('Please provide team name and project description');
      return;
    }

    if (!githubProfile?.github_verified) {
      toast.error('Please connect your GitHub account first');
      return;
    }

    if (!selectedRepoUrl) {
      toast.error('Please select a GitHub repository');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-team', {
        body: {
          teamName: teamName.trim(),
          tagline: tagline.trim(),
          projectDescription: projectDescription.trim(),
          githubRepo: selectedRepoUrl,
          userId,
          hackathonId: selectedHackathon?.id,
        },
      });

      if (error) throw error;

      toast.success(`Team "${teamName}" created successfully! Share your invite code with teammates.`);

      // Close modal and refresh data
      setShowJoinModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Team creation error:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoining(true);
    try {
      const { data, error } = await supabase.functions.invoke('join-team', {
        body: {
          inviteCode: inviteCode.trim(),
          userId,
        },
      });

      if (error) throw error;

      toast.success(`Join request sent! Waiting for team approval.`);

      // Close modal and refresh data
      setShowJoinModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Join team error:', error);
      toast.error(error.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setTagline('');
    setProjectDescription('');
    setGithubRepo('');
    setSelectedRepoUrl('');
    setRepos([]);
    setInviteCode('');
    setModalStep('hackathon');
    setSelectedHackathon(null);
  };

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied to clipboard!');
  };

  const handleCopyInviteLink = (code: string) => {
    const inviteUrl = `${window.location.origin}/join-team?code=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Hackathon Participation
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Join hackathons, create teams, and connect your projects
            </p>
          </div>
          <Button onClick={handleJoinHackathonClick}>
            <Plus className="h-4 w-4 mr-2" />
            Join Hackathon
          </Button>
        </div>

        <Separator />

        {userTeams.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Hackathon Teams Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join a hackathon and create or join a team to get started
            </p>
            <Button onClick={handleJoinHackathonClick} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Join Your First Hackathon
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userTeams.map((team) => {
              const isOwner = team.owner_id === userId;

              return (
                <Card key={team.id} className="p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          {isOwner && (
                            <Badge variant="secondary" className="text-xs">
                              Owner
                            </Badge>
                          )}
                        </div>
                        {team.tagline && (
                          <p className="text-sm text-muted-foreground">{team.tagline}</p>
                        )}
                        {team.hackathons && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="gap-1">
                              <Trophy className="h-3 w-3" />
                              {team.hackathons.name}
                            </Badge>
                            {team.hackathons.status === 'active' && (
                              <Badge variant="destructive" className="gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <GitHubRepoInput
                      teamId={team.id}
                      currentRepo={team.github_repo}
                      isOwner={isOwner}
                    />

                    {isOwner && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Team Invite Code
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              value={team.invite_code}
                              readOnly
                              className="font-mono"
                            />
                            <Button
                              onClick={() => handleCopyInviteCode(team.invite_code)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleCopyInviteLink(team.invite_code)}
                              variant="outline"
                              size="sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Share this code or link with teammates to invite them
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Join Hackathon Modal */}
      <Dialog open={showJoinModal} onOpenChange={(open) => {
        setShowJoinModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {modalStep === 'hackathon' && (
            <>
              <DialogHeader>
                <DialogTitle>Select a Hackathon</DialogTitle>
                <DialogDescription>
                  Choose which hackathon you want to participate in
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {hackathons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active hackathons available</p>
                  </div>
                ) : (
                  hackathons.map((hackathon) => (
                    <Card
                      key={hackathon.id}
                      className="cursor-pointer hover:border-primary transition-colors p-4"
                      onClick={() => handleHackathonSelect(hackathon)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{hackathon.name}</h3>
                            {hackathon.status === 'active' && (
                              <Badge variant="destructive" className="gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {hackathon.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hackathon.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(hackathon.start_date), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              ${hackathon.prize_pool.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          {modalStep === 'team-action' && selectedHackathon && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedHackathon.name}</DialogTitle>
                <DialogDescription>
                  Create a new team or join an existing one
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors p-6" onClick={() => setModalStep('create')}>
                  <Users className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Create New Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new team and invite members
                  </p>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors p-6" onClick={() => setModalStep('join')}>
                  <UserPlus className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Join Existing Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Use an invite code to join a team
                  </p>
                </Card>
              </div>

              <Button variant="outline" onClick={() => setModalStep('hackathon')}>
                Back to Hackathons
              </Button>
            </>
          )}

          {modalStep === 'create' && selectedHackathon && (
            <>
              <DialogHeader>
                <DialogTitle>Create Team for {selectedHackathon.name}</DialogTitle>
                <DialogDescription>
                  Enter your team details and project information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name *</Label>
                  <Input
                    id="team-name"
                    placeholder="e.g., Code Ninjas"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="A brief catchy description"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-desc">Project Description *</Label>
                  <Textarea
                    id="project-desc"
                    placeholder="What are you building?"
                    rows={4}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">GitHub Repository *</Label>

                  {!githubProfile?.github_verified ? (
                    <>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connect your GitHub account to select a repository for your team
                        </AlertDescription>
                      </Alert>
                      <GitHubConnectButton
                        profile={githubProfile || {}}
                        onProfileUpdate={(updated) => setGithubProfile({ ...githubProfile, ...updated })}
                        onRefreshRepos={fetchRepositories}
                      />
                    </>
                  ) : loadingRepos ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading repositories...
                    </div>
                  ) : repos.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No repositories found.{' '}
                        <a
                          href="https://github.com/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Create a new repository on GitHub
                        </a>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Select value={selectedRepoUrl} onValueChange={setSelectedRepoUrl}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a repository" />
                        </SelectTrigger>
                        <SelectContent>
                          {repos.map((repo) => (
                            <SelectItem key={repo.id} value={repo.url}>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{repo.name}</span>
                                  {repo.private && (
                                    <span className="text-xs text-muted-foreground">(Private)</span>
                                  )}
                                </div>
                                {repo.description && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                    {repo.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Required: Your team's project repository
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalStep('team-action')} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={creating || !teamName.trim() || !projectDescription.trim() || !githubProfile?.github_verified || !selectedRepoUrl}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Team
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {modalStep === 'join' && selectedHackathon && (
            <>
              <DialogHeader>
                <DialogTitle>Join Team for {selectedHackathon.name}</DialogTitle>
                <DialogDescription>
                  Enter the invite code shared by your team
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalStep('team-action')} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinTeam}
                    disabled={joining || !inviteCode.trim()}
                    className="flex-1"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Send Join Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
