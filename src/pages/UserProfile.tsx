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
import { UserBettingHistory } from '@/components/profile/UserBettingHistory';
import { ArrowLeft, Wallet, Trophy, TrendingUp, Target } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  wallet_balance: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
}

interface TeamMembership {
  id: string;
  role: string;
  teams: {
    id: string;
    name: string;
    logo_url: string;
  };
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      // Fetch user
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        setUser(userData);
      }

      // Fetch team memberships
      const { data: teamsData } = await supabase
        .from('team_members')
        .select('id, role, teams(id, name, logo_url)')
        .eq('user_id', userId);

      if (teamsData) {
        setTeams(teamsData as any);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId]);

  const accuracyRate = user && user.total_predictions > 0
    ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(1)
    : '0.0';

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

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
              <Button onClick={() => navigate('/leaderboard')} className="mt-4">
                Back to Leaderboard
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
            <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
            <span>/</span>
            <span className="text-foreground">{user.username}</span>
          </div>

          {/* Header Section */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{user.email}</p>
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
                title="XP"
                value={user.xp}
                icon={Trophy}
              />
              <StatsCard
                title="Wallet Balance"
                value={`${user.wallet_balance} HC`}
                icon={Wallet}
              />
              <StatsCard
                title="Total Predictions"
                value={user.total_predictions}
                icon={TrendingUp}
              />
              <StatsCard
                title="Accuracy Rate"
                value={`${accuracyRate}%`}
                icon={Target}
              />
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">Betting History</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Correct Predictions</p>
                        <p className="text-2xl font-bold text-green-500">{user.correct_predictions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Incorrect Predictions</p>
                        <p className="text-2xl font-bold text-red-500">
                          {user.total_predictions - user.correct_predictions}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <p className="text-muted-foreground">Activity feed coming soon...</p>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <UserBettingHistory userId={user.id} />
                </TabsContent>

                <TabsContent value="teams">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Team Memberships ({teams.length})</h3>
                    <div className="space-y-3">
                      {teams.map((membership) => (
                        <Card 
                          key={membership.id}
                          className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/teams/${membership.teams.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={membership.teams.logo_url} />
                              <AvatarFallback>{membership.teams.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{membership.teams.name}</p>
                              <p className="text-sm text-muted-foreground">{membership.role}</p>
                            </div>
                            <Badge variant="secondary">{membership.role}</Badge>
                          </div>
                        </Card>
                      ))}
                      {teams.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No team memberships</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-medium">{accuracyRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total XP</span>
                    <span className="font-medium">{user.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Teams</span>
                    <span className="font-medium">{teams.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
