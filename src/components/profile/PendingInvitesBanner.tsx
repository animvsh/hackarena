import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface TeamInvite {
  id: string;
  team_id: string;
  message: string | null;
  teams: {
    name: string;
    logo_url: string | null;
  };
}

interface PendingInvitesBannerProps {
  userId: string;
}

export function PendingInvitesBanner({ userId }: PendingInvitesBannerProps) {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingInvites();

    // Subscribe to new invites
    const channel = supabase
      .channel('team-invites')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_invites',
          filter: `invited_user_id=eq.${userId}`,
        },
        () => {
          fetchPendingInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchPendingInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          id,
          team_id,
          message,
          teams (
            name,
            logo_url
          )
        `)
        .eq('invited_user_id', userId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .limit(3);

      if (error) throw error;
      setInvites(data as any || []);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    }
  };

  const handleResponse = async (inviteId: string, status: 'accepted' | 'declined') => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('respond-to-team-invite', {
        body: { inviteId, status }
      });

      if (error) throw error;

      toast.success(status === 'accepted' ? 'Invite accepted!' : 'Invite declined');
      fetchPendingInvites();
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast.error('Failed to respond to invite');
    } finally {
      setLoading(false);
    }
  };

  if (invites.length === 0) return null;

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Mail className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Team Invitations
        <Badge variant="secondary">{invites.length}</Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 space-y-3">
        {invites.map((invite) => (
          <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-background rounded-lg">
            <div>
              <p className="font-semibold">{invite.teams.name}</p>
              {invite.message && (
                <p className="text-sm text-muted-foreground mt-1">{invite.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleResponse(invite.id, 'accepted')}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResponse(invite.id, 'declined')}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
