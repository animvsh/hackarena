import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users, Radio, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface HackathonCardProps {
  hackathon: {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    prize_pool: number;
    total_participants: number;
    description: string;
  };
  onViewBroadcast: (id: string) => void;
  onViewMarkets: (id: string) => void;
  isLive?: boolean;
}

export function HackathonCard({ hackathon, onViewBroadcast, onViewMarkets, isLive }: HackathonCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all border-border/50">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">{hackathon.name}</h3>
            {isLive && (
              <Badge variant="default" className="bg-success">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                Live Now
              </Badge>
            )}
          </div>
          <Trophy className="w-6 h-6 text-primary" />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {hackathon.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{hackathon.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(hackathon.start_date), 'MMM d')} - {format(new Date(hackathon.end_date), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold text-primary">
              ${hackathon.prize_pool.toLocaleString()} Prize Pool
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{hackathon.total_participants} Participants</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isLive && (
            <Button
              onClick={() => onViewBroadcast(hackathon.id)}
              className="flex-1 gap-2"
            >
              <Radio className="w-4 h-4" />
              Watch Live
            </Button>
          )}
          <Button
            onClick={() => onViewMarkets(hackathon.id)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Markets
          </Button>
          <Button
            onClick={() => window.location.href = `/hackathons/${hackathon.id}/teams/new`}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Users className="w-4 h-4" />
            Teams
          </Button>
        </div>
      </div>
    </Card>
  );
}
