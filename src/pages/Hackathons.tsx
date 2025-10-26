import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { HackathonCard } from "@/components/HackathonCard";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, History, Download } from "lucide-react";
import { DevpostImportModal } from "@/components/DevpostImportModal";

interface Hackathon {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  total_participants: number;
  description: string;
  website: string;
}

const Hackathons = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('start_date', { ascending: false });

    if (data && !error) {
      setHackathons(data as Hackathon[]);
    }
    setLoading(false);
  };

  const liveHackathons = hackathons.filter(h => h.status === 'active');
  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const pastHackathons = hackathons.filter(h => h.status === 'completed');

  const handleViewBroadcast = (hackathonId: string) => {
    navigate(`/hackathons/${hackathonId}/broadcast`);
  };

  const handleViewMarkets = (hackathonId: string) => {
    navigate(`/hackathons/${hackathonId}/markets`);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-neon-green" />
              <h1 className="text-3xl font-bold">Hackathons</h1>
            </div>
            <Button onClick={() => setShowImportModal(true)} className="gap-2">
              <Download className="w-4 h-4" />
              Import from Devpost
            </Button>
          </div>
          <p className="text-muted-foreground">
            Watch live broadcasts, place bets, and follow your favorite hackathon teams
          </p>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="live" className="gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live ({liveHackathons.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingHackathons.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History className="w-4 h-4" />
              Past ({pastHackathons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
            ) : liveHackathons.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">No live hackathons right now</h2>
                <p className="text-muted-foreground">Check back soon or explore upcoming events</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {liveHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onViewBroadcast={handleViewBroadcast}
                    onViewMarkets={handleViewMarkets}
                    isLive
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
            ) : upcomingHackathons.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">No upcoming hackathons</h2>
                <p className="text-muted-foreground">New events will be announced soon</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onViewBroadcast={handleViewBroadcast}
                    onViewMarkets={handleViewMarkets}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
            ) : pastHackathons.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">No past hackathons</h2>
                <p className="text-muted-foreground">History will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onViewBroadcast={handleViewBroadcast}
                    onViewMarkets={handleViewMarkets}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DevpostImportModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
          onSuccess={fetchHackathons}
        />
      </div>
    </AppLayout>
  );
};

export default Hackathons;
