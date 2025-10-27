import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TeamCard } from "@/components/TeamCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users2, ArrowLeft, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Team {
  id: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  category: string[];
  tech_stack: string[];
  github_repo: string | null;
  devpost_url: string | null;
  status: string;
  team_size: number;
  current_progress: number;
  momentum_score: string; // Changed to string to match database
}

const HackathonTeams = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathon, setHackathon] = useState<any>(null);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("momentum");

  useEffect(() => {
    fetchHackathonAndTeams();
  }, [hackathonId]);

  useEffect(() => {
    filterAndSortTeams();
  }, [teams, searchQuery, sortBy]);

  const fetchHackathonAndTeams = async () => {
    setLoading(true);
    
    // Fetch hackathon
    const { data: hackathonData } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();
    
    if (hackathonData) {
      setHackathon(hackathonData);
    }

    // Fetch teams for this hackathon
    const { data, error } = await supabase
      .from('hackathon_teams')
      .select('*')
      .eq('hackathon_id', hackathonId);

    if (data && !error) {
      // Map hackathon_teams to teams format
      const formattedTeams = data.map(team => ({
        id: team.id,
        name: team.name,
        tagline: team.tagline,
        logo_url: team.logo_url,
        category: typeof team.category === 'string' ? [team.category] : (team.category || []),
        tech_stack: team.tech_stack || [],
        github_repo: team.github_url,
        devpost_url: team.devpost_url,
        status: 'active',
        team_size: team.team_size || 0,
        current_progress: team.current_progress || 0,
        momentum_score: String(team.momentum_score || '0'),
      }));
      setTeams(formattedTeams);
    }
    setLoading(false);
  };

  const filterAndSortTeams = () => {
    let filtered = teams;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.category?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        team.tech_stack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'momentum':
          return parseFloat(b.momentum_score) - parseFloat(a.momentum_score);
        case 'progress':
          return b.current_progress - a.current_progress;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTeams(filtered);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/hackathons')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hackathons
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {hackathon?.name || 'Teams'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse all teams competing in this hackathon
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, categories, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="momentum">Momentum</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => navigate(`/hackathons/${hackathonId}/teams/new`)}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full" />
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No teams found</h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Check back soon for new teams"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={{ ...team, momentum_score: parseFloat(team.momentum_score) }}
                onClick={() => navigate(`/hackathons/${hackathonId}/teams/${team.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HackathonTeams;
