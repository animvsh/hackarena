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
import { InviteToTeamModal } from '@/components/profile/InviteToTeamModal';
import { UserTeamsSection } from '@/components/profile/UserTeamsSection';
import { ArrowLeft, Wallet, Trophy, TrendingUp, Target, UserPlus, MapPin, Linkedin, Github, Globe, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberships } from '@/hooks/useTeamMemberships';
import { useProfileViews } from '@/hooks/useProfileViews';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  wallet_balance: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  bio?: string;
  headline?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: any[];
  experience?: any[];
  education?: any[];
  projects?: any[];
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
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { memberships: teamMemberships } = useTeamMemberships(userId);
  const { trackView } = useProfileViews(userId);

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
        setUser(userData as User);
      }

      // Track profile view
      if (currentUser?.id) {
        trackView(currentUser.id);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId, currentUser, trackView]);

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
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="text-4xl">{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                    {user.headline && (
                      <p className="text-lg text-muted-foreground mb-2">{user.headline}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </span>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2">
                      {user.linkedin_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.portfolio_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${user.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {currentUser && currentUser.id !== user.id && (
                      <Button onClick={() => setInviteModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite to Team
                      </Button>
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
                    <h3 className="font-semibold mb-6">Team Memberships</h3>
                    <UserTeamsSection memberships={teamMemberships} isOwnProfile={false} />
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
                    <span className="font-medium">{teamMemberships.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {user && (
        <InviteToTeamModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          targetUserId={user.id}
          targetUserEmail={user.email}
          targetUsername={user.username}
        />
      )}
    </div>
  );
}
