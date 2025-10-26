import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Trophy, Users, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface HackathonSelectionProps {
  onSelected: (hackathonId: string | null) => void;
  onBack: () => void;
}

export const HackathonSelection = ({ onSelected, onBack }: HackathonSelectionProps) => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Sort to prioritize Cal Hacks
      const sorted = data?.sort((a, b) => {
        if (a.name.toLowerCase().includes('cal hacks')) return -1;
        if (b.name.toLowerCase().includes('cal hacks')) return 1;
        return 0;
      }) || [];

      setHackathons(sorted);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hackathonId: string) => {
    setSelectedId(hackathonId);
  };

  const handleContinue = () => {
    onSelected(selectedId);
  };

  const handleSkip = () => {
    onSelected(null);
  };

  const isCalHacks = (name: string) => name.toLowerCase().includes('cal hacks');

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Which hackathon are you participating in?</CardTitle>
          <CardDescription>Select your hackathon to connect with your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (hackathons.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle>No Active Hackathons</CardTitle>
          <CardDescription>There are no active hackathons right now</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Check back later when hackathons are announced!
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={handleSkip} className="flex-1">
              Continue Without Hackathon
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Which hackathon are you participating in?</CardTitle>
        <CardDescription>Select your hackathon to connect with your team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {hackathons.map((hackathon) => {
            const isFeatured = isCalHacks(hackathon.name);
            const isSelected = selectedId === hackathon.id;
            const isLive = hackathon.status === 'active';

            return (
              <Card
                key={hackathon.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary shadow-lg'
                    : isFeatured
                    ? 'border-primary/50'
                    : 'hover:border-primary/30'
                }`}
                onClick={() => handleSelect(hackathon.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-xl">{hackathon.name}</CardTitle>
                        {isFeatured && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                        {isLive && (
                          <Badge variant="destructive" className="gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {hackathon.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{hackathon.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="truncate">
                        {format(new Date(hackathon.start_date), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>${hackathon.prize_pool.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{hackathon.total_participants} hackers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedId}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
