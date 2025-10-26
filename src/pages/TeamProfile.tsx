import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/profile/StatsCard';
import { TeamActivityFeed } from '@/components/profile/TeamActivityFeed';
import { QuickBetWidget } from '@/components/profile/QuickBetWidget';
import { UserHoverCard } from '@/components/profile/UserHoverCard';
import { useMarketOdds } from '@/hooks/useMarketOdds';
import { useOddsHistory } from '@/hooks/useOddsHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Target, Github, ExternalLink, Trophy, Code, Settings, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface Team {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  category: string[];
  tech_stack: string[];
  github_repo: string;
  devpost_url: string;
  current_progress: number;
  momentum_score: number;
  team_size: number;
  status: string;
  invite_code?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  github_username: string;
  user_id: string;
  users?: {
    username: string;
    avatar_url: string;
  };
}

export default function TeamProfile() {
  const { teamId, hackathonId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [marketId, setMarketId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [isTeamCreator, setIsTeamCreator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { odds } = useMarketOdds(marketId);
  const teamOdds = odds.find(o => o.team_id === teamId);
  const { history: oddsHistory } = useOddsHistory(teamId, marketId);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch team from hackathon_teams
      const { data: teamData } = await supabase
        .from('hackathon_teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamData) {
        // Map to expected format
        setTeam({
          id: teamData.id,
          name: teamData.name,
          tagline: teamData.tagline || '',
          logo_url: teamData.logo_url || '',
          category: typeof teamData.category === 'string' ? [teamData.category] : (teamData.category || []),
          tech_stack: teamData.tech_stack || [],
          github_repo: teamData.github_url || '',
          devpost_url: teamData.devpost_url || '',
          current_progress: teamData.current_progress || 0,
          momentum_score: parseFloat(teamData.momentum_score || '0'),
          team_size: teamData.team_size || 0,
          status: 'active',
          invite_code: teamData.invite_code || '',
        });
      }

      // Fetch team members from hackathon_team_members
      const { data: membersData } = await supabase
        .from('hackathon_team_members')
        .select(`
          id,
          role,
          hacker_id,
          hackers (
            id,
            name,
            github_username,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (membersData) {
        // Check if current user is the team creator (has role "Owner")
        const ownerMember = membersData.find((m: any) => 
          m.role === 'Owner' || m.role === 'owner'
        );
        
        if (ownerMember && user) {
          // Check if the owner's hacker is linked to the current user
          // We need to check if user has a hacker profile
          const { data: currentUser } = await supabase
            .from('users')
            .select('github_username, linkedin_url')
            .eq('id', user.id)
            .single();
          
          if (currentUser) {
            const { data: hackerProfile } = await supabase
              .from('hackers')
              .select('id')
              .or(`github_username.eq.${currentUser.github_username || ''},linkedin_url.eq.${currentUser.linkedin_url || ''}`)
              .single();
            
            if (hackerProfile && hackerProfile.id === ownerMember.hacker_id) {
              setIsTeamCreator(true);
            }
          }
        }

        // Fetch stats for each member
        const membersWithStats = await Promise.all(membersData.map(async (m: any) => {
          const { data: stats } = await supabase
            .from('hacker_stats')
            .select('overall_rating, technical_skill, hackathon_experience, innovation')
            .eq('hacker_id', m.hacker_id)
            .single();
          
          return {
            id: m.id,
            name: m.hackers?.name || 'Unknown',
            role: m.role || 'Member',
            github_username: m.hackers?.github_username || '',
            github_url: m.hackers?.github_username ? `https://github.com/${m.hackers.github_username}` : undefined,
            user_id: m.hackers?.id || '',
            stats: stats,
            users: {
              username: m.hackers?.name || '',
              avatar_url: m.hackers?.avatar_url || '',
            }
          };
        }));
        
        setMembers(membersWithStats as any);
      }

      // Fetch market ID
      const { data: marketData } = await supabase
        .from('market_odds')
        .select('market_id')
        .eq('team_id', teamId)
        .limit(1)
        .single();

      if (marketData) {
        setMarketId(marketData.market_id);
      }

      setLoading(false);
    };

    fetchTeamData();

    // Subscribe to real-time updates for hacker_stats
    const statsChannel = supabase
      .channel('hacker-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hacker_stats',
        },
        () => {
          // Refresh team data when stats update
          fetchTeamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
    };
  }, [teamId]);

  const handleBet = (amount: number) => {
    toast.success(`Bet placed: ${amount} HC on ${team?.name}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Skeleton className="h-48 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Team not found</p>
              <Button onClick={() => {
                if (hackathonId) {
                  navigate(`/hackathons/${hackathonId}/teams`);
                } else {
                  navigate('/hackathons');
                }
              }} className="mt-4">
                Back to Hackathons
              </Button>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/teams" className="hover:text-foreground">Teams</Link>
            <span>/</span>
            <span className="text-foreground">{team.name}</span>
          </div>

          {/* Header Section */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={team.logo_url} alt={team.name} />
                <AvatarFallback>{team.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{team.tagline}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {team.category?.map((cat) => (
                        <Badge key={cat} variant="secondary">{cat}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      {team.github_repo && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={team.github_repo} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {team.devpost_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={team.devpost_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Devpost
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isTeamCreator && (
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Team
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Manage Team Settings</DialogTitle>
                          </DialogHeader>
                          <TeamSettingsDialog 
                            team={team} 
                            onUpdate={(updatedTeam) => {
                              setTeam({...team, ...updatedTeam});
                              setDialogOpen(false);
                              // Force refresh to show new GitHub activity
                              window.location.reload();
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className={`grid gap-4 mt-6 pt-6 border-t ${team.invite_code || teamOdds ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <StatsCard
                title="Progress"
                value={`${team.current_progress}%`}
                icon={Target}
              />
              <StatsCard
                title="Momentum"
                value={team.momentum_score.toFixed(1)}
                icon={TrendingUp}
              />
              <StatsCard
                title="Team Size"
                value={team.team_size}
                icon={Users}
              />
              {team.invite_code && isTeamCreator && (
                <StatsCard
                  title="Invite Code"
                  value={team.invite_code}
                  icon={Code}
                />
              )}
              {teamOdds && teamOdds.current_odds > 0 && (
                <StatsCard
                  title="Current Odds"
                  value={`${teamOdds.current_odds.toFixed(1)}%`}
                  icon={Trophy}
                />
              )}
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="members">Team Members</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">About</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {team.category?.map((cat) => (
                            <Badge key={cat} variant="outline">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {team.tech_stack?.map((tech) => (
                            <Badge key={tech} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Status</p>
                        <Badge>{team.status}</Badge>
                      </div>
                    </div>
                  </Card>

                  <TeamActivityFeed teamId={team.id} githubUrl={team.github_repo} />
                </TabsContent>

                <TabsContent value="performance">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Performance Metrics</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Based on commits from the last 24 hours
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={oddsHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="odds" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Odds %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </TabsContent>

                <TabsContent value="members">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Team Members ({members.length})</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {members.map((member) => (
                        <UserHoverCard
                          key={member.id}
                          userId={member.user_id || ''}
                          username={member.users?.username || member.name}
                          avatarUrl={member.users?.avatar_url}
                        >
                          <Card className="p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-primary/20">
                                <AvatarImage src={member.users?.avatar_url} />
                                <AvatarFallback className="bg-primary/10">
                                  {(member.users?.username || member.name)[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium hover:text-primary transition-colors">
                                  {member.users?.username || member.name}
                                </p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                {member.github_username && (
                                  <a 
                                    href={`https://github.com/${member.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <Github className="w-3 h-3" />
                                    {member.github_username}
                                  </a>
                                )}
                              </div>
                            </div>
                            {member.stats && (
                              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <div className="text-muted-foreground">Rating</div>
                                  <div className="font-semibold">{member.stats.overall_rating?.toFixed(1) || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Technical</div>
                                  <div className="font-semibold">{member.stats.technical_skill || 'N/A'}</div>
                                </div>
                              </div>
                            )}
                          </Card>
                        </UserHoverCard>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {teamOdds && marketId && (
                <QuickBetWidget
                  teamId={team.id}
                  teamName={team.name}
                  currentOdds={teamOdds.current_odds}
                  marketId={marketId}
                  onBetClick={handleBet}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Team Settings Dialog Component
interface TeamSettingsDialogProps {
  team: Team;
  onUpdate: (updatedTeam: Partial<Team>) => void;
}

const TeamSettingsDialog = ({ team, onUpdate }: TeamSettingsDialogProps) => {
  const [githubUrl, setGithubUrl] = useState(team.github_repo);
  const [devpostUrl, setDevpostUrl] = useState(team.devpost_url);
  const [tagline, setTagline] = useState(team.tagline);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('hackathon_teams')
        .update({
          github_url: githubUrl,  // Update github_url in Supabase
          devpost_url: devpostUrl,
          tagline: tagline,
        })
        .eq('id', team.id);

      if (error) throw error;

      // Update local state with new github_repo (mapped from github_url)
      onUpdate({
        github_repo: githubUrl,  // This will be used by TeamActivityFeed
        devpost_url: devpostUrl,
        tagline: tagline,
      });
      
      toast.success('Team settings updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Textarea
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Describe your team..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="github">GitHub Repository URL</Label>
        <Input
          id="github"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
        />
      </div>

      <div>
        <Label htmlFor="devpost">Devpost URL (Optional)</Label>
        <Input
          id="devpost"
          type="url"
          value={devpostUrl}
          onChange={(e) => setDevpostUrl(e.target.value)}
          placeholder="https://devpost.com/software/..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
