import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Users, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function TeamInvite() {
  const { inviteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [inviter, setInviter] = useState<any>(null);

  useEffect(() => {
    fetchInviteDetails();
  }, [inviteId]);

  const fetchInviteDetails = async () => {
    if (!inviteId) return;

    setLoading(true);
    try {
      // Fetch invite details
      const { data: inviteData, error: inviteError } = await supabase
        .from('team_invites')
        .select('*, teams(*)')
        .eq('id', inviteId)
        .single();

      if (inviteError) throw inviteError;

      setInvite(inviteData);
      setTeam(inviteData.teams);

      // Fetch inviter details
      const { data: inviterData } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', inviteData.invited_by)
        .single();

      setInviter(inviterData);
    } catch (error) {
      console.error('Error fetching invite:', error);
      toast.error("Invite not found or expired");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: 'accept' | 'reject') => {
    if (!user) {
      toast.info("Please sign in to respond to this invitation");
      navigate(`/auth?redirect=/invite/${inviteId}`);
      return;
    }

    setResponding(true);
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-team-invite', {
        body: { invite_id: inviteId, response },
      });

      if (error) throw error;

      toast.success(response === 'accept' ? 'Welcome to the team!' : 'Invite declined');

      if (response === 'accept' && data.team_id) {
        navigate(`/teams/${data.team_id}`);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error responding to invite:', error);
      toast.error(error.message || 'Failed to respond to invitation');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!invite || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 w-16 h-16 mx-auto flex items-center justify-center">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Invite Not Found</h1>
          <p className="text-muted-foreground">
            This invitation may have expired or been cancelled.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  const isAlreadyResponded = invite.status !== 'pending';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Team Invitation</h1>
            <p className="text-muted-foreground">
              You've been invited to join <strong>{team.name}</strong>
            </p>
          </div>

          {team.logo_url && (
            <img
              src={team.logo_url}
              alt={team.name}
              className="w-24 h-24 mx-auto rounded-lg object-cover"
            />
          )}

          {team.tagline && (
            <p className="text-sm text-muted-foreground italic">"{team.tagline}"</p>
          )}

          {inviter && (
            <p className="text-sm">
              Invited by <strong>{inviter.username}</strong>
            </p>
          )}

          {invite.message && (
            <Card className="p-4 bg-muted">
              <p className="text-sm">{invite.message}</p>
            </Card>
          )}
        </div>

        {isExpired ? (
          <div className="text-center space-y-3">
            <p className="text-destructive">This invitation has expired</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        ) : isAlreadyResponded ? (
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              You've already responded to this invitation
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => handleResponse('accept')}
              disabled={responding}
              className="flex-1"
            >
              {responding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Accept Invite
            </Button>
            <Button
              onClick={() => handleResponse('reject')}
              disabled={responding}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            You'll need to sign in or create an account to join this team
          </p>
        )}
      </Card>
    </div>
  );
}