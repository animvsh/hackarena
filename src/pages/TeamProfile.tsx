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
import { ArrowLeft, Users, TrendingUp, Target, Github, ExternalLink, Trophy } from 'lucide-react';
import { toast } from 'sonner';

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
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [marketId, setMarketId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const { odds } = useMarketOdds(marketId);
  const teamOdds = odds.find(o => o.team_id === teamId);
  const { history: oddsHistory } = useOddsHistory(teamId, marketId);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;

      // Fetch team
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamData) {
        setTeam(teamData);
      }

      // Fetch team members
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*, users(username, avatar_url)')
        .eq('team_id', teamId);

      if (membersData) {
        setMembers(membersData);
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
              <Button onClick={() => navigate('/teams')} className="mt-4">
                Back to Teams
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

                  <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
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
              {teamOdds && (
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

                  <TeamActivityFeed teamId={team.id} />
                </TabsContent>

                <TabsContent value="performance">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">24-Hour Odds Performance</h3>
                    <ResponsiveContainer width="100%" height={400}>
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
                              <div>
                                <p className="font-medium hover:text-primary transition-colors">
                                  {member.users?.username || member.name}
                                </p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
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
