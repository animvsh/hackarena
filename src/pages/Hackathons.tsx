import React, { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Trophy, DollarSign, Users, Calendar, MapPin, Star, TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { simpleGitHubFetcher, calculateHackerStats } from "@/lib/simple-github-fetcher";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'finished';
  totalPrizePool: number;
  categories: PrizeCategory[];
  teams: Team[];
}

interface PrizeCategory {
  id: string;
  name: string;
  description: string;
  prizeAmount: number;
  positions: {
    first: number;
    second: number;
    third: number;
  };
}

interface Team {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  category: string;
  tech_stack: string[];
  github_repo: string;
  devpost_url: string;
  status: string;
  team_size: number;
  current_progress: number;
  momentum_score: number;
  members: TeamMember[];
  stats: {
    overall_rating: number;
    technical_skill: number;
    hackathon_experience: number;
    innovation_score: number;
  };
  betting_odds: {
    win_probability: number;
    american_odds: number;
    decimal_odds: number;
  };
}

interface TeamMember {
  id: string;
  name: string;
  github_username: string;
  avatar_url: string;
  stats: {
    overall_rating: number;
    technical_skill: number;
    hackathon_experience: number;
    innovation_score: number;
  };
}

const Hackathons = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PrizeCategory | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchParams] = useSearchParams();

  const generateHackathonData = async (): Promise<Hackathon[]> => {
    const hackathonTemplates = [
      {
        name: "TechCrunch Disrupt 2024",
        description: "The world's premier startup competition",
        location: "San Francisco, CA",
        totalPrizePool: 50000,
        categories: [
          { name: "Best Overall", prizeAmount: 25000, positions: { first: 15000, second: 7500, third: 2500 } },
          { name: "AI/ML Innovation", prizeAmount: 15000, positions: { first: 10000, second: 3500, third: 1500 } },
          { name: "FinTech Solutions", prizeAmount: 10000, positions: { first: 6000, second: 2500, third: 1500 } }
        ]
      },
      {
        name: "HackMIT 2024",
        description: "MIT's premier hackathon",
        location: "Cambridge, MA",
        totalPrizePool: 30000,
        categories: [
          { name: "Best Overall", prizeAmount: 15000, positions: { first: 10000, second: 3500, third: 1500 } },
          { name: "Social Impact", prizeAmount: 8000, positions: { first: 5000, second: 2000, third: 1000 } },
          { name: "Mobile App", prizeAmount: 7000, positions: { first: 4000, second: 2000, third: 1000 } }
        ]
      },
      {
        name: "PennApps 2024",
        description: "University of Pennsylvania's hackathon",
        location: "Philadelphia, PA",
        totalPrizePool: 25000,
        categories: [
          { name: "Best Overall", prizeAmount: 12000, positions: { first: 8000, second: 3000, third: 1000 } },
          { name: "Healthcare Tech", prizeAmount: 8000, positions: { first: 5000, second: 2000, third: 1000 } },
          { name: "Blockchain", prizeAmount: 5000, positions: { first: 3000, second: 1500, third: 500 } }
        ]
      }
    ];

    const hackathons: Hackathon[] = [];

    for (const template of hackathonTemplates) {
      // Generate teams for this hackathon
      const teams = await generateTeamsForHackathon(template.name);
      
      // Generate prize categories
      const categories: PrizeCategory[] = template.categories.map(cat => ({
        id: `cat_${template.name}_${cat.name}`.replace(/\s+/g, '_').toLowerCase(),
        name: cat.name,
        description: `Prize for ${cat.name}`,
        prizeAmount: cat.prizeAmount,
        positions: cat.positions
      }));

      hackathons.push({
        id: `hackathon_${template.name}`.replace(/\s+/g, '_').toLowerCase(),
        name: template.name,
        description: template.description,
        location: template.location,
        startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.5 ? 'upcoming' : 'live',
        totalPrizePool: template.totalPrizePool,
        categories,
        teams
      });
    }

    return hackathons;
  };

  const generateTeamsForHackathon = async (hackathonName: string): Promise<Team[]> => {
    const teamNames = [
      "QuantumLeap", "DataDriven", "CloudNative", "AIRevolution", "BlockchainBros",
      "FinTechFusion", "HealthTechHeroes", "MobileMasters", "Web3Wizards", "DevOpsDynamos",
      "CyberSecuritySquad", "IoTInnovators", "ARVRAdventurers", "MLMasters", "FullStackFighters"
    ];

    const techStacks = [
      ["React", "Node.js", "MongoDB"], ["Python", "TensorFlow", "PostgreSQL"],
      ["Vue.js", "Express", "MySQL"], ["Angular", "Django", "Redis"],
      ["Next.js", "FastAPI", "Supabase"], ["Svelte", "Flask", "Firebase"]
    ];

    const categories = ["AI/ML", "FinTech", "Healthcare", "Education", "Social Impact", "Gaming"];

    const teams: Team[] = [];

    for (let i = 0; i < 8; i++) {
      const teamName = teamNames[i];
      const techStack = techStacks[Math.floor(Math.random() * techStacks.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Generate team members
      const members = await generateTeamMembers(teamName, 3 + Math.floor(Math.random() * 3));
      
      // Calculate team stats from member stats (averaged)
      const teamStats = calculateTeamStats(members);
      
      // Calculate betting odds based on team stats
      const bettingOdds = calculateBettingOdds(teamStats.overall_rating);
      
      teams.push({
        id: `team_${hackathonName}_${teamName}`.replace(/\s+/g, '_').toLowerCase(),
        name: teamName,
        tagline: `Building the future with ${category}`,
        logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${teamName}`,
        category,
        tech_stack: techStack,
        github_repo: `https://github.com/${teamName.toLowerCase()}`,
        devpost_url: `https://devpost.com/software/${teamName.toLowerCase()}`,
        status: "active",
        team_size: members.length,
        current_progress: Math.floor(Math.random() * 100),
        momentum_score: Math.floor(Math.random() * 100),
        members,
        stats: teamStats,
        betting_odds: bettingOdds
      });
    }

    return teams;
  };

  const generateTeamMembers = async (teamName: string, count: number): Promise<TeamMember[]> => {
    const githubUsernames = [
      'v2pir', 'animvsh', 'abhisheknaiidu', 'coderjojo', 'octocat', 'mojombo', 'defunkt', 'pjhyett', 
      'wycats', 'ezmobius', 'ivey', 'evanphx', 'vanpelt', 'wayneeseguin', 'brynary', 'kevinclark', 
      'technoweenie', 'macournoyer', 'takeo', 'caged', 'topfunky', 'anotherjesse', 'roland', 'lukas',
      'fanquake', 'schacon', 'rtomayko', 'matz', 'rkh', 'josh', 'svenfuchs', 'ry', 'jashkenas',
      'josevalim', 'tenderlove', 'dhh', 'jeresig', 'addyosmani', 'paulirish', 'fat', 'mdo',
      'substack', 'isaacs', 'tj', 'rauchg', 'gaearon', 'yyx990803', 'kentcdodds', 'getify',
      'sindresorhus', 'jakearchibald'
    ];

    const members: TeamMember[] = [];
    const usedUsernames = new Set<string>();
    let successfulFetches = 0;

    // Try to fetch real GitHub users first
    for (const username of githubUsernames) {
      if (members.length >= count) break;
      if (usedUsernames.has(username)) continue;
      
      usedUsernames.add(username);
      const githubUser = await simpleGitHubFetcher(username);
      
      if (githubUser) {
        const stats = calculateHackerStats(githubUser);
        members.push({
          id: `member_${teamName}_${username}`,
          name: githubUser.name || githubUser.login,
          github_username: githubUser.login,
          avatar_url: `https://avatars.githubusercontent.com/${githubUser.login}`,
          stats
        });
        successfulFetches++;
      }
    }

    // Fill remaining slots with simulated developers
    while (members.length < count) {
      const simulatedId = `simulated_${teamName}_${members.length + 1}`;
      const simulatedName = `Developer ${members.length + 1}`;
      
      members.push({
        id: simulatedId,
        name: simulatedName,
        github_username: `dev_${members.length + 1}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${simulatedId}`,
        stats: {
          overall_rating: parseFloat((Math.random() * 40 + 40).toFixed(1)), // 40-80 range
          technical_skill: parseFloat((Math.random() * 40 + 40).toFixed(1)),
          hackathon_experience: parseFloat((Math.random() * 40 + 40).toFixed(1)),
          innovation_score: parseFloat((Math.random() * 40 + 40).toFixed(1))
        }
      });
    }

    console.log(`Generated ${members.length} team members for ${teamName} (${successfulFetches} real GitHub profiles)`);
    return members;
  };

  const calculateTeamStats = (members: TeamMember[]) => {
    const avgOverall = members.reduce((sum, member) => sum + member.stats.overall_rating, 0) / members.length;
    const avgTechnical = members.reduce((sum, member) => sum + member.stats.technical_skill, 0) / members.length;
    const avgExperience = members.reduce((sum, member) => sum + member.stats.hackathon_experience, 0) / members.length;
    const avgInnovation = members.reduce((sum, member) => sum + member.stats.innovation_score, 0) / members.length;

    return {
      overall_rating: parseFloat(avgOverall.toFixed(1)),
      technical_skill: parseFloat(avgTechnical.toFixed(1)),
      hackathon_experience: parseFloat(avgExperience.toFixed(1)),
      innovation_score: parseFloat(avgInnovation.toFixed(1))
    };
  };

  const calculateBettingOdds = (overallRating: number) => {
    // Convert rating to win probability (0-1)
    const winProbability = overallRating / 100;
    
    // Calculate American odds
    let americanOdds: number;
    if (winProbability >= 0.5) {
      americanOdds = Math.round(-100 * winProbability / (1 - winProbability));
    } else {
      americanOdds = Math.round(100 * (1 - winProbability) / winProbability);
    }
    
    // Calculate decimal odds
    const decimalOdds = 1 / winProbability;
    
    return {
      win_probability: parseFloat((winProbability * 100).toFixed(1)),
      american_odds: americanOdds,
      decimal_odds: parseFloat(decimalOdds.toFixed(2))
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'live':
        return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case 'finished':
        return <Badge className="bg-gray-100 text-gray-800">Finished</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getOddsColor = (odds: number) => {
    if (odds > 0) return "text-green-600";
    if (odds < 0) return "text-red-600";
    return "text-gray-600";
  };

  const calculatePayout = (betAmount: number, odds: number) => {
    return (betAmount * odds).toFixed(2);
  };

  useEffect(() => {
    const loadHackathons = async () => {
      setLoading(true);
      const data = await generateHackathonData();
      setHackathons(data);
      
      // Check if a specific hackathon was requested via URL params
      const hackathonId = searchParams.get('hackathon');
      if (hackathonId) {
        const hackathon = data.find(h => h.id === hackathonId);
        if (hackathon) {
          setSelectedHackathon(hackathon);
        }
      }
      
      setLoading(false);
    };
    
    loadHackathons();
  }, [searchParams]);

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
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
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Hackathons</h1>
          </div>
          <p className="text-muted-foreground">
            Bet on hackathon teams based on their averaged stats
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hackathons</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hackathons Grid */}
        <div className="grid gap-6">
          {filteredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">{hackathon.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{hackathon.description}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(hackathon.status)}
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hackathon.location}
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-lg font-semibold">${hackathon.totalPrizePool.toLocaleString()} Total Prize Pool</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-lg font-semibold">{hackathon.teams.length} Teams</span>
                    </div>
                  </div>
                </div>

                {/* Teams and Betting Lines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Team Betting Lines</h3>
                    <Badge variant="outline" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Stats Averaged
                    </Badge>
                  </div>
                  {hackathon.teams
                    .sort((a, b) => b.stats.overall_rating - a.stats.overall_rating)
                    .map((team) => (
                      <Card key={team.id} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={team.logo_url} alt={team.name} />
                              <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-lg text-foreground">{team.name}</h4>
                              <p className="text-sm text-muted-foreground">{team.tagline}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {team.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {team.team_size} members
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            {/* Team Stats */}
                            <div className="text-center">
                              <div className="text-xl font-bold text-primary">
                                {team.stats.overall_rating}
                              </div>
                              <div className="text-xs text-muted-foreground">Overall Rating</div>
                              <div className="text-xs text-muted-foreground">(Averaged)</div>
                            </div>

                            {/* Betting Odds */}
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getOddsColor(team.betting_odds.american_odds)}`}>
                                {team.betting_odds.american_odds > 0 ? '+' : ''}{team.betting_odds.american_odds}
                              </div>
                              <div className="text-xs text-muted-foreground">American Odds</div>
                              <div className="text-xs text-muted-foreground">{team.betting_odds.win_probability}% win prob</div>
                            </div>

                            {/* Bet Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => {
                                    setSelectedHackathon(hackathon);
                                    setSelectedTeam(team);
                                  }}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                                    <h3 className="font-semibold text-foreground">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">{hackathon.name}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div className="text-muted-foreground">Team Rating</div>
                                      <div className="font-semibold text-foreground">{team.stats.overall_rating} (Averaged)</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground">Win Probability</div>
                                      <div className="font-semibold text-foreground">{team.betting_odds.win_probability}%</div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-foreground">Bet Amount (HackCoins)</label>
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
                                      <div className="text-lg font-semibold text-foreground">
                                        {calculatePayout(parseFloat(betAmount), team.betting_odds.decimal_odds)} HackCoins
                                      </div>
                                    </div>
                                  )}

                                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Place Bet
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Team Stats Breakdown */}
                        <div className="mt-4 grid grid-cols-4 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Technical</span>
                              <span>{team.stats.technical_skill}</span>
                            </div>
                            <Progress value={team.stats.technical_skill} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Experience</span>
                              <span>{team.stats.hackathon_experience}</span>
                            </div>
                            <Progress value={team.stats.hackathon_experience} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Innovation</span>
                              <span>{team.stats.innovation_score}</span>
                            </div>
                            <Progress value={team.stats.innovation_score} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{team.current_progress}%</span>
                            </div>
                            <Progress value={team.current_progress} className="h-2" />
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-muted-foreground">No hackathons found matching your search.</p>
          </div>
        )}
        </main>
      </div>
    );
};

export default Hackathons;