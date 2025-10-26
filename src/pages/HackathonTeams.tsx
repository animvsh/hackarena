import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { HackathonHeader } from "@/components/HackathonHeader";
import { HackathonTeamCard } from "@/components/HackathonTeamCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Team {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  category: string[];
  tech_stack: string[];
  team_size: number;
  momentum_score: number;
}

const HackathonTeams = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [hackathonId]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .order('momentum_score', { ascending: false });

    if (data && !error) {
      setTeams(data as Team[]);
    }
    setLoading(false);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || team.category?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(new Set(teams.flatMap(t => t.category || [])));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />
        
        {hackathonId && <HackathonHeader hackathonId={hackathonId} />}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Competing Teams</h1>
              </div>
              <p className="text-muted-foreground">
                Browse all teams participating in this hackathon
              </p>
            </div>
            
            <Button onClick={() => navigate(`/hackathons/${hackathonId}/teams/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              Create/Join Team
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Badge>
              {allCategories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[280px] w-full" />
              ))}
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No teams found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Try adjusting your search" : "Be the first to create a team!"}
              </p>
              <Button onClick={() => navigate(`/hackathons/${hackathonId}/teams/new`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <HackathonTeamCard
                  key={team.id}
                  team={team}
                  hackathonId={hackathonId!}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HackathonTeams;
