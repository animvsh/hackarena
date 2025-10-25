import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { GitCommit, TrendingUp, Trophy, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  content?: string;
  created_at: string;
  metadata?: any;
}

interface TeamActivityFeedProps {
  teamId: string;
}

export function TeamActivityFeed({ teamId }: TeamActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from('progress_updates')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setActivities(data);
      }
      setLoading(false);
    };

    fetchActivities();

    const channel = supabase
      .channel(`team-activity-${teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'progress_updates',
        filter: `team_id=eq.${teamId}`
      }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'commit': return GitCommit;
      case 'milestone': return Trophy;
      case 'team': return Users;
      default: return TrendingUp;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'commit': return 'default';
      case 'milestone': return 'default';
      case 'team': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-muted-foreground">Loading activity...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      {activity.content && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                      )}
                    </div>
                    <Badge variant={getColor(activity.type) as any}>{activity.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
