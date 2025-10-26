import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";
import hackcastLogo from "@/assets/hackcast-logo.png";

interface Commentary {
  id: string;
  text: string;
  voice_persona: string;
  event_type: string | null;
  created_at: string;
}

const RadioPage = () => {
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);

  useEffect(() => {
    fetchCommentary();

    // Subscribe to new commentary
    const channel = supabase
      .channel('radio-commentary')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commentary_feed',
        },
        (payload) => {
          setCommentary((prev) => [payload.new as Commentary, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCommentary = async () => {
    const { data } = await supabase
      .from('commentary_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setCommentary(data);
    }
  };

  const getPersonaColor = (persona: string) => {
    if (persona.includes('Ava')) return 'bg-blue-500';
    if (persona.includes('Coach')) return 'bg-red-500';
    if (persona.includes('Reka')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const getEventIcon = (eventType: string | null) => {
    switch (eventType) {
      case 'market_shift':
        return '📈';
      case 'milestone':
        return '🏆';
      case 'demo':
        return '🎬';
      default:
        return '💬';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <img src={hackcastLogo} alt="HackCast Radio" className="h-12" />
            <h1 className="text-3xl font-bold">Radio</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered live commentary and real-time broadcast
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Radio className="w-16 h-16 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  <img src={hackcastLogo} alt="HackCast LIVE" className="h-16" />
                </div>
                <p className="text-sm text-muted-foreground">24/7 Hackathon Coverage</p>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant={isPlaying ? "default" : "outline"}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause Stream
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play Stream
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-10 text-right">
                    {volume[0]}%
                  </span>
                </div>
              </div>

              {/* Now Playing */}
              {commentary.length > 0 && (
                <div className="mt-6 p-4 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">NOW PLAYING</p>
                  <p className="text-sm line-clamp-2">{commentary[0].text}</p>
                  <p className="text-xs text-primary mt-1">
                    {commentary[0].voice_persona}
                  </p>
                </div>
              )}

              {/* Personas */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  AI COMMENTATORS
                </p>
                <div className="space-y-2">
                  {['Analyst Ava', 'Coach K', 'StatBot Reka'].map((persona) => (
                    <div
                      key={persona}
                      className="flex items-center gap-2 p-2 bg-background/50 rounded"
                    >
                      <div className={`w-2 h-2 rounded-full ${getPersonaColor(persona)}`} />
                      <span className="text-xs">{persona}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Commentary Feed */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Commentary Feed</h3>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {commentary.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg transition-all ${
                        index === 0
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-background/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-1">{getEventIcon(item.event_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.voice_persona}
                            </Badge>
                            {item.event_type && (
                              <Badge variant="secondary" className="text-xs">
                                {item.event_type.replace('_', ' ')}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDistanceToNow(new Date(item.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadioPage;
