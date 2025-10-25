import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Eye, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserHoverCard } from './UserHoverCard';
import { formatDistanceToNow } from 'date-fns';

interface Visitor {
  id: string;
  viewed_at: string;
  viewer: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

interface RecentVisitorsProps {
  userId: string;
}

export function RecentVisitors({ userId }: RecentVisitorsProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentVisitors();
  }, [userId]);

  const fetchRecentVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          id,
          viewed_at,
          viewer:viewer_user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('profile_user_id', userId)
        .not('viewer_user_id', 'is', null)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setVisitors(data as any || []);
    } catch (error) {
      console.error('Error fetching recent visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Recent Visitors</h3>
      </div>

      {visitors.length > 0 ? (
        <div className="space-y-3">
          {visitors.map((visit) => {
            if (!visit.viewer) return null;
            
            return (
              <UserHoverCard key={visit.id} userId={visit.viewer.id} username={visit.viewer.username}>
                <div className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={visit.viewer.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{visit.viewer.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(visit.viewed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </UserHoverCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No visitors yet
        </div>
      )}
    </Card>
  );
}
