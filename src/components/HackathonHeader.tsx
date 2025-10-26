import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface HackathonHeaderProps {
  hackathonId: string;
}

export function HackathonHeader({ hackathonId }: HackathonHeaderProps) {
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathon();
  }, [hackathonId]);

  const fetchHackathon = async () => {
    const { data } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();

    if (data) {
      setHackathon(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <Skeleton className="h-24 w-full mb-6" />;
  }

  if (!hackathon) {
    return null;
  }

  return (
    <div className="bg-card border border-border/50 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{hackathon.name}</h2>
          {hackathon.status === 'active' && (
            <Badge variant="default" className="bg-success">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Live Now
            </Badge>
          )}
        </div>
        <Trophy className="w-8 h-8 text-primary" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{hackathon.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(hackathon.start_date), 'MMM d')} - {format(new Date(hackathon.end_date), 'MMM d')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="w-4 h-4" />
          <span className="font-semibold text-primary">
            ${hackathon.prize_pool.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{hackathon.total_participants} Teams</span>
        </div>
      </div>
    </div>
  );
}
