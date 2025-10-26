import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  total_participants: number;
  website: string;
}

interface HackathonInfoCardProps {
  hackathon: Hackathon;
}

export function HackathonInfoCard({ hackathon }: HackathonInfoCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">{hackathon.name}</h3>
            {hackathon.status === 'active' && (
              <Badge variant="destructive" className="gap-1">
                <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{hackathon.description}</p>
        </div>
        {hackathon.website && (
          <Button variant="ghost" size="sm" asChild>
            <a href={hackathon.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-semibold">{hackathon.location}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Dates</p>
            <p className="text-sm font-semibold">
              {new Date(hackathon.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(hackathon.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-sm font-semibold">${(hackathon.prize_pool / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-sm font-semibold">{hackathon.total_participants}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => navigate(`/markets`)}
          variant="default"
          className="flex-1"
        >
          View Markets
        </Button>
        <Button 
          onClick={() => navigate(`/hackathons/${hackathon.id}/teams`)}
          variant="outline"
          className="flex-1"
        >
          Browse Teams
        </Button>
        <Button 
          onClick={() => navigate(`/leaderboard`)}
          variant="outline"
          className="flex-1"
        >
          Leaderboard
        </Button>
      </div>
    </div>
  );
}
