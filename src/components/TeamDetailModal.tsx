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
import { supabase } from "@/integrations/supabase/client";
import { GitCommit, Image, Trophy, Twitter, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team && open) {
      fetchProgressUpdates();
      fetchTeamMembers();
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
