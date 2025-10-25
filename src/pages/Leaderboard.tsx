import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Coins, Users, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamRanking {
  id: string;
  name: string;
  logo_url: string | null;
  category: string[];
  current_progress: number;
  momentum_score: number;
}

interface UserRanking {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  wallet_balance: number;
}

const Leaderboard = () => {
  const [teamsByProgress, setTeamsByProgress] = useState<TeamRanking[]>([]);
  const [teamsByMomentum, setTeamsByMomentum] = useState<TeamRanking[]>([]);
  const [topPredictors, setTopPredictors] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);

    // Fetch teams by progress
    const { data: progressData } = await supabase
      .from('teams')
      .select('id, name, logo_url, category, current_progress, momentum_score')
      .order('current_progress', { ascending: false })
      .limit(10);

    if (progressData) setTeamsByProgress(progressData);

    // Fetch teams by momentum
    const { data: momentumData } = await supabase
      .from('teams')
      .select('id, name, logo_url, category, current_progress, momentum_score')
      .order('momentum_score', { ascending: false })
      .limit(10);

    if (momentumData) setTeamsByMomentum(momentumData);

    // Fetch top predictors
    const { data: predictorsData } = await supabase
      .from('users')
      .select('id, username, avatar_url, xp, total_predictions, correct_predictions, wallet_balance')
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

  const getAccuracyRate = (user: UserRanking) => {
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
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Teams (Progress)
            </TabsTrigger>
            <TabsTrigger value="momentum">
              <Trophy className="w-4 h-4 mr-2" />
              Top Teams (Momentum)
            </TabsTrigger>
            <TabsTrigger value="predictors">
              <Coins className="w-4 h-4 mr-2" />
              Top Predictors
            </TabsTrigger>
          </TabsList>

          {/* Teams by Progress */}
          <TabsContent value="progress" className="mt-6">
            <Card className="p-6">
              <div className="space-y-3">
                {teamsByProgress.map((team, index) => (
                  <div
                    key={team.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      index < 3
                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                        : 'bg-background'
                    }`}
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
                      <div className="flex flex-wrap gap-1 mt-1">
                        {team.category?.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {team.current_progress}%
                      </p>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Teams by Momentum */}
          <TabsContent value="momentum" className="mt-6">
            <Card className="p-6">
              <div className="space-y-3">
                {teamsByMomentum.map((team, index) => (
                  <div
                    key={team.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      index < 3
                        ? 'bg-gradient-to-r from-red-500/10 to-transparent'
                        : 'bg-background'
                    }`}
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
                      <div className="flex flex-wrap gap-1 mt-1">
                        {team.category?.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-500">
                        {team.momentum_score.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Momentum</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Top Predictors */}
          <TabsContent value="predictors" className="mt-6">
            <Card className="p-6">
              <div className="space-y-3">
                {topPredictors.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
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
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{user.username}</p>
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
