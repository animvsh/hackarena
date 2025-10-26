import { useState } from 'react';
import { EnhancedBroadcastVideoPlayer } from './EnhancedBroadcastVideoPlayer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin, Maximize2 } from 'lucide-react';
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
}

interface BroadcastCarouselProps {
  hackathons: Hackathon[];
  onHackathonChange: (hackathon: Hackathon) => void;
}

export function BroadcastCarousel({ hackathons, onHackathonChange }: BroadcastCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleSlideChange = (api: CarouselApi) => {
    if (!api) return;
    const index = api.selectedScrollSnap();
    setCurrent(index);
    if (hackathons[index]) {
      onHackathonChange(hackathons[index]);
    }
  };

  if (hackathons.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border text-center">
        <p className="text-muted-foreground">No active hackathons broadcasting</p>
      </div>
    );
  }

  if (hackathons.length === 1) {
    // Single hackathon - no carousel needed
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="gap-1">
              <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
              LIVE
            </Badge>
            <h3 className="text-xl font-bold">{hackathons[0].name}</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/hackathons/${hackathons[0].id}/broadcast`)}
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Full Screen
          </Button>
        </div>
        <EnhancedBroadcastVideoPlayer hackathonId={hackathons[0].id} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Live Hackathon Broadcasts</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{current + 1} of {hackathons.length}</span>
        </div>
      </div>

      <Carousel 
        setApi={(api) => {
          setApi(api);
          api?.on('select', () => handleSlideChange(api));
        }}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {hackathons.map((hackathon) => (
            <CarouselItem key={hackathon.id}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="gap-1">
                      <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
                      LIVE
                    </Badge>
                    <h4 className="text-lg font-semibold">{hackathon.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/hackathons/${hackathon.id}/teams`)}
                      className="gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Teams
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/hackathons/${hackathon.id}/broadcast`)}
                      className="gap-2"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Full Screen
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hackathon.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(hackathon.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(hackathon.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {hackathon.total_participants} participants
                  </div>
                </div>

                <EnhancedBroadcastVideoPlayer hackathonId={hackathon.id} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {hackathons.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
}
