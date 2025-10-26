import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Coins, Users, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserHoverCard } from "@/components/profile/UserHoverCard";

interface TeamRanking {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  hackathon_name: string;
  hackathon_id: string;
  overall_rating: number;
  technical_skill: number;
  hackathon_experience: number;
  innovation: number;
}

interface HackathonLeaderboard {
  hackathon_id: string;
  hackathon_name: string;
  teams: TeamRanking[];
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [hackathonLeaderboards, setHackathonLeaderboards] = useState<HackathonLeaderboard[]>([]);
  const [topPredictors, setTopPredictors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);

    // Fetch all hackathons
    const { data: hackathons } = await supabase
      .from('hackathons')
      .select('id, name')
      .eq('status', 'active');

    if (hackathons && hackathons.length > 0) {
      const leaderboards: HackathonLeaderboard[] = [];

      // For each hackathon, get top 10 teams by overall rating
      for (const hackathon of hackathons) {
        const { data: teamsData } = await supabase
          .from('hackathon_teams')
          .select(`
            id,
            name,
            logo_url,
            category,
            hackathon_id,
            hackathons!hackathon_teams_hackathon_id_fkey (name),
            team_stats (
              avg_overall_rating,
              avg_technical_skill,
              avg_hackathon_experience,
              avg_innovation
            )
          `)
          .eq('hackathon_id', hackathon.id)
          .order('current_progress', { ascending: false })
          .limit(3);

        if (teamsData && teamsData.length > 0) {
          const teamsWithStats = teamsData
            .map(team => {
              const stats = team.team_stats?.[0];
              return {
                id: team.id,
                name: team.name,
                logo_url: team.logo_url,
                category: team.category || '',
                hackathon_name: team.hackathons?.name || hackathon.name,
                hackathon_id: team.hackathon_id,
                overall_rating: parseFloat(stats?.avg_overall_rating || '0'),
                technical_skill: parseFloat(stats?.avg_technical_skill || '0'),
                hackathon_experience: parseFloat(stats?.avg_hackathon_experience || '0'),
                innovation: parseFloat(stats?.avg_innovation || '0')
              };
            })
            .filter(team => team.overall_rating > 0) // Only include teams with stats
            .sort((a, b) => b.overall_rating - a.overall_rating);

          leaderboards.push({
            hackathon_id: hackathon.id,
            hackathon_name: hackathon.name,
            teams: teamsWithStats
          });
        }
      }

      setHackathonLeaderboards(leaderboards);
    }

    // Fetch top predictors
    const { data: predictorsData } = await supabase
      .from('users')
      .select('id, username, avatar_url, xp, total_predictions, correct_predictions, wallet_balance, accuracy_rate')
      .order('xp', { ascending: false })
      .limit(10);

    if (predictorsData) setTopPredictors(predictorsData);

    setLoading(false);
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getAccuracyRate = (user: any) => {
    // Use accuracy_rate if available (from betting), otherwise calculate from predictions
    if (user.accuracy_rate !== undefined && user.accuracy_rate !== null) {
      return user.accuracy_rate.toFixed(1);
    }
    if (user.total_predictions === 0) return 0;
    return ((user.correct_predictions / user.total_predictions) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">
            Top teams, predictors, and real-time rankings
          </p>
        </div>

        {/* Leaderboards */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">
              <Trophy className="w-4 h-4 mr-2" />
              Top Teams by Hackathon
            </TabsTrigger>
            <TabsTrigger value="predictors">
              <Coins className="w-4 h-4 mr-2" />
              Top Predictors
            </TabsTrigger>
          </TabsList>

          {/* Teams by Hackathon */}
          <TabsContent value="teams" className="mt-6">
            <div className="space-y-6">
              {hackathonLeaderboards.map((leaderboard) => (
                <Card key={leaderboard.hackathon_id} className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{leaderboard.hackathon_name}</h2>
                    <p className="text-sm text-muted-foreground">Top {leaderboard.teams.length} teams by rating</p>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.teams.map((team, index) => (
                      <div
                        key={team.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer hover:bg-muted ${
                          index < 3
                            ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                            : 'bg-background'
                        }`}
                        onClick={() => navigate(`/hackathons/${leaderboard.hackathon_id}/teams/${team.id}`)}
                      >
                        <div className="text-2xl font-bold w-12 text-center">
                          {getMedalIcon(index + 1)}
                        </div>
                        <img
                          src={team.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${team.name}`}
                          alt={team.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{team.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {team.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Skill: {team.technical_skill} | Exp: {team.hackathon_experience} | Innovation: {team.innovation}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {team.overall_rating.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Overall Rating</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Predictors */}
          <TabsContent value="predictors" className="mt-6">
            <Card className="p-6">
              <div className="space-y-3">
                {topPredictors.map((user, index) => (
                  <UserHoverCard
                    key={user.id}
                    userId={user.id}
                    username={user.username}
                    avatarUrl={user.avatar_url}
                    xp={user.xp}
                    totalPredictions={user.total_predictions}
                    correctPredictions={user.correct_predictions}
                  >
                    <div
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer hover:bg-muted ${
                        index < 3
                          ? 'bg-gradient-to-r from-purple-500/10 to-transparent'
                          : 'bg-background'
                      }`}
                    >
                      <div className="text-2xl font-bold w-12 text-center">
                        {index === 0 ? (
                          <Crown className="w-8 h-8 text-yellow-500 mx-auto" />
                        ) : (
                          getMedalIcon(index + 1)
                        )}
                      </div>
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-12 h-12 rounded-full border-2 border-primary/20"
                      />
                      <div className="flex-1">
                        <p className="font-semibold hover:text-primary transition-colors">{user.username}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{user.total_predictions} predictions</span>
                          <span>•</span>
                          <span>{getAccuracyRate(user)}% accurate</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-500">
                          {user.xp.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">XP</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.wallet_balance} HC
                        </p>
                      </div>
                    </div>
                  </UserHoverCard>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
