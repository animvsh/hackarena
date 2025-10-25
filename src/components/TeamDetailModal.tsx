import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useOddsHistory } from "@/hooks/useOddsHistory";
import { GitCommit, Image, Trophy, Twitter, Clock, Users, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Team {
  id: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  category: string[];
  tech_stack: string[];
  github_repo: string | null;
  current_progress: number;
  momentum_score: number;
}

interface ProgressUpdate {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  impact_score: number;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  users: {
    username: string;
    avatar_url: string | null;
  };
}

interface TeamDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export const TeamDetailModal = ({ open, onOpenChange, team }: TeamDetailModalProps) => {
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [marketId, setMarketId] = useState<string | undefined>();
  const { history: oddsHistory, loading: historyLoading } = useOddsHistory(team?.id, marketId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team && open) {
      fetchProgressUpdates();
      fetchTeamMembers();
      
      // Fetch market association
      const fetchMarket = async () => {
        const { data } = await supabase
          .from('market_odds')
          .select('market_id')
          .eq('team_id', team.id)
          .limit(1)
          .single();
        
        if (data) setMarketId(data.market_id);
      };
      fetchMarket();
    }
  }, [team, open]);

  const fetchProgressUpdates = async () => {
    if (!team) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('progress_updates')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && !error) {
      setProgressUpdates(data);
    }
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    if (!team) return;

    const { data } = await supabase
      .from('team_permissions')
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });

    if (data) {
      setTeamMembers(data as any);
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-4 h-4" />;
      case 'screenshot':
        return <Image className="w-4 h-4" />;
      case 'milestone':
        return <Trophy className="w-4 h-4" />;
      case 'tweet':
        return <Twitter className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'commit':
        return "bg-blue-500/20 text-blue-500";
      case 'screenshot':
        return "bg-purple-500/20 text-purple-500";
      case 'milestone':
        return "bg-yellow-500/20 text-yellow-500";
      case 'tweet':
        return "bg-sky-500/20 text-sky-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={team.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${team.name}`}
              alt={team.name}
              className="w-16 h-16 rounded-lg"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-1">{team.name}</DialogTitle>
              {team.tagline && (
                <p className="text-sm text-muted-foreground">{team.tagline}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members ({teamMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScrollArea className="max-h-[60vh] pr-4">
              {/* Categories & Tech Stack */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {team.category?.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>

                {team.tech_stack && team.tech_stack.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.tech_stack.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-2xl font-bold mb-2">{team.current_progress}%</p>
              <Progress value={team.current_progress} className="h-2" />
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Momentum</p>
              <p className="text-2xl font-bold">{team.momentum_score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {team.momentum_score >= 75 ? "🔥 Hot Streak" :
                 team.momentum_score >= 50 ? "📈 Building" : "📉 Early Stages"}
              </p>
            </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Progress Timeline</h4>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading updates...</p>
                ) : progressUpdates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No updates yet</p>
                ) : (
                  <div className="space-y-3">
                    {progressUpdates.map((update, index) => (
                      <div
                        key={update.id}
                        className="flex gap-3 p-3 bg-background/50 rounded-lg hover:bg-background transition-colors"
                      >
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${getUpdateColor(update.type)}`}>
                            {getUpdateIcon(update.type)}
                          </div>
                          {index < progressUpdates.length - 1 && (
                            <div className="w-px h-full bg-border mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm">{update.title}</p>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              +{update.impact_score} impact
                            </Badge>
                          </div>
                          {update.content && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {update.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance">
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Historical Odds Chart */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    24-Hour Odds Performance
                  </h3>
                  {historyLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Loading chart...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={oddsHistory.map(point => ({
                        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        odds: point.odds
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          label={{ value: 'Odds %', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="odds" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* Betting Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                    <div className="flex items-center gap-2">
                      {oddsHistory.length > 1 && (
                        oddsHistory[oddsHistory.length - 1].odds > oddsHistory[0].odds ? (
                          <>
                            <TrendingUp className="w-5 h-5 text-success" />
                            <span className="text-2xl font-bold text-success">
                              +{(oddsHistory[oddsHistory.length - 1].odds - oddsHistory[0].odds).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-5 h-5 text-destructive" />
                            <span className="text-2xl font-bold text-destructive">
                              {(oddsHistory[oddsHistory.length - 1].odds - oddsHistory[0].odds).toFixed(1)}%
                            </span>
                          </>
                        )
                      )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                    <p className="text-2xl font-bold">
                      {oddsHistory.length > 0 ? oddsHistory[oddsHistory.length - 1].volume : 0} HC
                    </p>
                  </Card>

                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Peak Odds</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.max(...oddsHistory.map(h => h.odds), 0).toFixed(1)}%
                    </p>
                  </Card>

                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Lowest Odds</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {Math.min(...oddsHistory.map(h => h.odds), 100).toFixed(1)}%
                    </p>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="members">
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {teamMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No team members found</p>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={member.users.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.users.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{member.users.username}</p>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      {member.role === 'owner' && (
                        <Badge>Owner</Badge>
                      )}
                      {member.role === 'admin' && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
