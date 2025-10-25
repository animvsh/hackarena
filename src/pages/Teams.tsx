import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TeamCard } from "@/components/TeamCard";
import { TeamDetailModal } from "@/components/TeamDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  momentum_score: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("momentum");

  useEffect(() => {
    fetchTeams();

    // Subscribe to team updates
    const channel = supabase
      .channel('teams-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterAndSortTeams();
  }, [teams, searchQuery, sortBy]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('status', 'active');

    if (data && !error) {
      setTeams(data);
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
          return b.momentum_score - a.momentum_score;
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

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Teams</h1>
          </div>
          <p className="text-muted-foreground">
            Browse all hackathon teams and track their progress in real-time
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
                team={team}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        )}
      </main>

      <TeamDetailModal
        open={!!selectedTeam}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
        team={selectedTeam}
      />
    </div>
  );
};

export default Teams;
