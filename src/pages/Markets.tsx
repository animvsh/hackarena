import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, Users, DollarSign, Search, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Team {
  id: string;
  name: string;
  tagline: string;
  category: string;
  logo_url: string;
  team_size: number;
  current_progress: number;
  momentum_score: number;
  // Generated random stats
  overall_rating: number;
  technical_skill: number;
  hackathon_experience: number;
  innovation_score: number;
  betting_odds: {
    american_odds: number;
    decimal_odds: number;
    win_probability: number;
  };
}

const Markets = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (hackathonId) {
      fetchHackathonTeams();
    }
  }, [hackathonId]);

  const fetchHackathonTeams = async () => {
    setLoading(true);
    try {
      // Fetch hackathon details
      const { data: hackathon, error: hackathonError } = await supabase
        .from('hackathons')
        .select('id, name, prize_pool')
        .eq('id', hackathonId)
        .single();

      if (hackathonError) {
        console.error('Error fetching hackathon:', hackathonError);
        setLoading(false);
        return;
      }

      // Fetch teams for this hackathon
      const { data: hackathonTeams, error: teamsError } = await supabase
        .from('hackathon_teams')
        .select('*')
        .eq('hackathon_id', hackathonId);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        setLoading(false);
        return;
      }

      if (hackathonTeams && hackathonTeams.length > 0) {
        // Generate random stats and betting odds for each team
        const teamsWithStats = hackathonTeams.map(team => generateTeamStats(team));
        setTeams(teamsWithStats);
      }
    } catch (error) {
      console.error('Error fetching hackathon teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTeamStats = (team: any): Team => {
    // Generate random stats between 50-95
    const overallRating = Math.floor(Math.random() * 45) + 50;
    const technicalSkill = Math.floor(Math.random() * 40) + 55;
    const hackathonExperience = Math.floor(Math.random() * 30) + 20;
    const innovationScore = Math.floor(Math.random() * 35) + 55;

    // Generate realistic betting odds based on rating
    const winProbability = Math.min(95, Math.max(5, overallRating));
    const americanOdds = winProbability > 50 
      ? Math.floor(-100 * winProbability / (100 - winProbability))
      : Math.floor(100 * (100 - winProbability) / winProbability);
    const decimalOdds = winProbability > 50 
      ? 100 / winProbability 
      : (100 - winProbability) / winProbability + 1;

    return {
      ...team,
      overall_rating: overallRating,
      technical_skill: technicalSkill,
      hackathon_experience: hackathonExperience,
      innovation_score: innovationScore,
      betting_odds: {
        american_odds: americanOdds,
        decimal_odds: Math.round(decimalOdds * 100) / 100,
        win_probability: winProbability
      }
    };
  };

  const calculatePayout = (betAmount: number, decimalOdds: number) => {
    return Math.round(betAmount * decimalOdds);
  };

  const getOddsColor = (odds: number) => {
    if (odds > 0) return "text-green-600";
    return "text-red-600";
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Team Betting Lines</h1>
          </div>
          <p className="text-muted-foreground">
            Place bets on teams based on their performance stats and odds
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="text-sm">
            <Trophy className="h-3 w-3 mr-1" />
            {teams.length} Teams Competing
          </Badge>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Teams Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={team.logo_url} alt={team.name} />
                        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{team.name}</CardTitle>
                        <CardDescription>{team.tagline}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {team.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {team.team_size} members
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {team.overall_rating}
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>

                      {/* Betting Odds */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getOddsColor(team.betting_odds.american_odds)}`}>
                          {team.betting_odds.american_odds > 0 ? '+' : ''}{team.betting_odds.american_odds}
                        </div>
                        <div className="text-xs text-muted-foreground">American Odds</div>
                        <div className="text-xs text-muted-foreground">{team.betting_odds.win_probability}% win</div>
                      </div>

                      {/* Bet Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedTeam(team)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Place Bet
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Place Bet</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">{team.name}</h3>
                              <p className="text-sm text-muted-foreground">{team.tagline}</p>
                            </div>
                            
                            {/* Team Stats */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Overall Rating</div>
                                <div className="font-semibold">{team.overall_rating}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Win Probability</div>
                                <div className="font-semibold">{team.betting_odds.win_probability}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Technical Skill</div>
                                <div className="font-semibold">{team.technical_skill}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Innovation</div>
                                <div className="font-semibold">{team.innovation_score}</div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Bet Amount (HackCoins)</label>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            {betAmount && (
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Potential Payout</div>
                                <div className="text-lg font-semibold">
                                  {calculatePayout(parseFloat(betAmount), team.betting_odds.decimal_odds)} HackCoins
                                </div>
                              </div>
                            )}

                            <Button className="w-full">
                              Place Bet
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Detailed Stats Breakdown */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Technical</span>
                        <span className="font-semibold">{team.technical_skill}</span>
                      </div>
                      <Progress value={team.technical_skill} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-semibold">{team.hackathon_experience}</span>
                      </div>
                      <Progress value={team.hackathon_experience} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Innovation</span>
                        <span className="font-semibold">{team.innovation_score}</span>
                      </div>
                      <Progress value={team.innovation_score} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{team.current_progress}%</span>
                      </div>
                      <Progress value={team.current_progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;
