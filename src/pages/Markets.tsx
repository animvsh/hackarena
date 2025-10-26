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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Prize {
  id: string;
  category: string;
  prize_amount: string;
  position: number;
  description: string;
}

const Markets = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCalculatingOdds, setIsCalculatingOdds] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);

  useEffect(() => {
    if (hackathonId) {
      autoCalculateAndFetch();
    }
  }, [hackathonId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  const autoCalculateAndFetch = async () => {
    if (!hackathonId) return;
    
    setLoadingMessage("Calculating betting lines...");
    
    // First calculate odds (this saves them to database)
    try {
      await supabase.functions.invoke('calculate-betting-odds', {
        body: { hackathonId }
      });
      console.log('Odds auto-calculated and saved to database');
      setLoadingMessage("Loading teams and odds...");
    } catch (error) {
      console.error('Error auto-calculating odds:', error);
    }
    
    // Then fetch the teams with the updated odds
    await fetchHackathonTeams();
  };

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

      // Fetch all prizes for this hackathon
      const { data: prizes } = await supabase
        .from('hackathon_prizes')
        .select('*')
        .eq('hackathon_id', hackathonId);

      console.log('Prizes:', prizes);

      // Store prizes
      if (prizes && prizes.length > 0) {
        setPrizes(prizes);
        // Only set initial prize if none is selected yet
        if (!selectedPrize) {
          setSelectedPrize(prizes[0]);
        }
      }

      // If no prizes exist, just fetch teams for display and return early
      if (!prizes || prizes.length === 0) {
        console.log('No prizes found. Skipping odds fetch.');
        // Still fetch teams for display
        const { data: hackathonTeams, error: teamsError } = await supabase
          .from('hackathon_teams')
          .select(`
            *,
            team_stats (
              avg_overall_rating,
              avg_technical_skill,
              avg_hackathon_experience,
              avg_innovation
            )
          `)
          .eq('hackathon_id', hackathonId);

        if (hackathonTeams && hackathonTeams.length > 0) {
          const teamsWithStats = hackathonTeams.map(team => {
            const stats = team.team_stats?.[0];
            if (stats) {
              const overallRating = parseFloat(stats.avg_overall_rating) || 70;
              return {
                ...team,
                overall_rating: overallRating,
                technical_skill: parseFloat(stats.avg_technical_skill) || 70,
                hackathon_experience: parseFloat(stats.avg_hackathon_experience) || 60,
                innovation_score: parseFloat(stats.avg_innovation) || 70,
                betting_odds: {
                  american_odds: 0,
                  decimal_odds: 1.0,
                  win_probability: 0
                }
              };
            }
            return generateTeamStats(team);
          });
          setTeams(teamsWithStats);
        }
        setLoading(false);
        return;
      }

      // Fetch teams for this hackathon with their stats
      const { data: hackathonTeams, error: teamsError } = await supabase
        .from('hackathon_teams')
      .select(`
          *,
          team_stats (
            avg_overall_rating,
            avg_technical_skill,
            avg_hackathon_experience,
            avg_innovation
          )
        `)
        .eq('hackathon_id', hackathonId);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        setLoading(false);
        return;
      }

      // Continue only if we have prizes
      if (!prizes || prizes.length === 0) {
        setLoading(false);
        return;
      }

      // Use selected prize (or first prize if none selected)
      const currentPrize = selectedPrize || prizes[0];

      // Fetch betting odds from database for the current prize
      const { data: oddsData, error: oddsError } = await supabase
        .from('betting_odds')
        .select('*')
        .eq('prize_id', currentPrize.id);

      console.log('Fetched odds:', oddsData);

      if (hackathonTeams && hackathonTeams.length > 0) {
        // Map odds to teams
        const teamsWithStats = hackathonTeams.map(team => {
          const stats = team.team_stats?.[0];
          const teamOdds = oddsData?.find(odds => odds.team_id === team.id);

          if (stats) {
            const overallRating = parseFloat(stats.avg_overall_rating) || 70;
            const technical_skill = parseFloat(stats.avg_technical_skill) || 70;
            const hackathon_experience = parseFloat(stats.avg_hackathon_experience) || 60;
            const innovation_score = parseFloat(stats.avg_innovation) || 70;

            // Use stored odds if available, otherwise calculate
            let bettingOdds;
            if (teamOdds) {
              bettingOdds = {
                american_odds: teamOdds.odds_american,
                decimal_odds: parseFloat(teamOdds.odds_decimal),
                win_probability: Math.round(parseFloat(teamOdds.implied_probability) * 10000) / 100
              };
            } else {
              // Calculate odds based on rating vs competitors
              // Get average rating of all teams
              const avgRating = hackathonTeams.reduce((sum, t) => {
                const tStats = t.team_stats?.[0];
                return sum + parseFloat(tStats?.avg_overall_rating || '70');
              }, 0) / hackathonTeams.length;

              // Calculate relative strength
              const relativeStrength = overallRating / Math.max(avgRating, 1);
              const winProbability = Math.min(95, Math.max(5, relativeStrength * 50));

              let americanOdds;
              if (winProbability > 50) {
                americanOdds = Math.floor(-100 * winProbability / (100 - winProbability));
              } else {
                americanOdds = Math.floor(100 * (100 - winProbability) / winProbability);
              }

              let decimalOdds;
              if (americanOdds > 0) {
                decimalOdds = 1 + (americanOdds / 100);
              } else {
                decimalOdds = 1 + (100 / Math.abs(americanOdds));
              }

              bettingOdds = {
                american_odds: americanOdds,
                decimal_odds: Math.round(decimalOdds * 100) / 100,
                win_probability: winProbability
              };
            }

            return {
              ...team,
              overall_rating: overallRating,
              technical_skill,
              hackathon_experience,
              innovation_score,
              betting_odds: bettingOdds
            };
          } else {
            return generateTeamStats(team);
          }
        });

        setTeams(teamsWithStats);
      }
    } catch (error) {
      console.error('Error fetching hackathon teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedTeam || !selectedPrize || !betAmount) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to place a bet');
      return;
    }

    setIsPlacingBet(true);
    
    try {
      const response = await supabase.functions.invoke('place-bet', {
        body: {
          userId: user.id,
          hackathonId,
          teamId: selectedTeam.id,
          prizeId: selectedPrize.id,
          betAmount: parseFloat(betAmount),
          oddsAmerican: selectedTeam.betting_odds.american_odds,
          oddsDecimal: selectedTeam.betting_odds.decimal_odds
        }
      });

      if (response.error) throw response.error;

      console.log('Bet placed successfully:', response.data);
      
      // Update user balance
      setUser({ ...user, wallet_balance: response.data.newBalance });
      
      // Reset form
      setBetAmount('');
      setSelectedTeam(null);
      setShowBettingModal(false);
      
      alert(`Bet placed successfully! Your new balance: ${response.data.newBalance} HackCoins`);
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(error.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
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

  const calculateOdds = async () => {
    if (!hackathonId) return;

    setIsCalculatingOdds(true);
    try {
      // Call the Edge Function to calculate betting odds
      const { data, error } = await supabase.functions.invoke('calculate-betting-odds', {
        body: { hackathonId }
      });

      if (error) {
        console.error('Error calculating odds:', error);
        alert('Failed to calculate odds. Please try again.');
        return;
      }

      console.log('Odds calculated:', data);
      
      // Refresh the teams data
      await fetchHackathonTeams();
      
      alert(`Successfully calculated odds for ${data.calculated} teams!`);
    } catch (error) {
      console.error('Error calculating odds:', error);
      alert('Failed to calculate odds. Please try again.');
    } finally {
      setIsCalculatingOdds(false);
    }
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Team Betting Lines</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  What do these numbers mean?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Understanding Betting Lines</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold mb-2">Overall Rating</h3>
                    <p className="text-muted-foreground">
                      A score from 0-100 that represents the team's overall capability, calculated by averaging each team member's GitHub/LinkedIn stats, hackathon experience, and technical skills.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold mb-2">American Odds (+120, -150, etc.)</h3>
                    <p className="text-muted-foreground mb-2">
                      Shows how much you'll win relative to a $100 bet:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li><strong>+120</strong> means you'll win $120 on a $100 bet (total payout: $220)</li>
                      <li><strong>-150</strong> means you need to bet $150 to win $100 (total payout: $250)</li>
                      <li>Higher numbers = less likely to win (underdogs)</li>
                      <li>Lower numbers = more likely to win (favorites)</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold mb-2">Win Probability</h3>
                    <p className="text-muted-foreground">
                      The percentage chance this team will win, calculated based on their stats compared to all other teams. For example, 35% means they have a 35% chance of winning.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold mb-2">Individual Stats Breakdown</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li><strong>Technical Skill:</strong> Average coding ability (0-100)</li>
                      <li><strong>Experience:</strong> Years of hackathon participation</li>
                      <li><strong>Innovation:</strong> Creative problem-solving ability</li>
                      <li><strong>Progress:</strong> Current project completion %</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">How Betting Works</h3>
                    <p className="text-muted-foreground">
                      Place a bet amount, and if the team wins, you'll receive your bet back plus the winnings based on the odds. 
                      The higher the odds, the riskier the bet but the bigger the potential payout!
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          <Button
            onClick={calculateOdds}
            disabled={isCalculatingOdds}
            className="ml-auto"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {isCalculatingOdds ? 'Recalculating...' : 'Recalculate Odds'}
          </Button>
        </div>

        {/* Prize Categories Tabs */}
        {prizes && prizes.length > 0 ? (
          <div className="mb-6">
            <Tabs value={selectedPrize?.id || prizes[0]?.id} onValueChange={(prizeId) => {
              const prize = prizes.find(p => p.id === prizeId);
              if (prize) {
                setSelectedPrize(prize);
                // Wait a moment for state to update, then fetch
                setTimeout(() => fetchHackathonTeams(), 100);
              }
            }}>
              <TabsList className="flex-wrap h-auto p-1 gap-2 bg-card">
                {prizes.map((prize) => (
                  <TabsTrigger key={prize.id} value={prize.id} className="text-sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    {prize.category} - ${parseFloat(prize.prize_amount).toLocaleString()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-muted rounded-lg text-center text-muted-foreground">
            No prizes configured for this hackathon
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Progress className="w-full max-w-md mb-4" value={33} />
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">{loadingMessage}</p>
              <p className="text-sm text-muted-foreground">This may take a few moments...</p>
            </div>
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
                              <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium">Bet Amount (HackCoins)</label>
                                <span className="text-sm text-muted-foreground">
                                  Balance: {user?.wallet_balance || 0} HackCoins
                                </span>
                              </div>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                className="mt-1"
                                max={user?.wallet_balance || 0}
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

                            <Button 
                              className="w-full"
                              onClick={handlePlaceBet}
                              disabled={!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > (user?.wallet_balance || 0)}
                            >
                              {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
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
