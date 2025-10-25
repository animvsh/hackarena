import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TeamInvite {
  id: string;
  invite_email: string;
  status: string;
  message: string | null;
  created_at: string;
  expires_at: string;
  invited_user_id: string | null;
  users?: {
    username: string;
    avatar_url: string | null;
  };
}

interface TeamInviteCardProps {
  invites: TeamInvite[];
  onRefresh: () => void;
}

export const TeamInviteCard = ({ invites, onRefresh }: TeamInviteCardProps) => {
  const handleCopyLink = (inviteId: string) => {
    const link = `${window.location.origin}/invite/${inviteId}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success("Invitation cancelled");
      onRefresh();
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast.error("Failed to cancel invitation");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      accepted: { variant: "default", label: "Accepted" },
      rejected: { variant: "destructive", label: "Declined" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (invites.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No invitations sent yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <Card key={invite.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <p className="font-medium">
                  {invite.users?.username || invite.invite_email}
                </p>
                {getStatusBadge(invite.status)}
                {invite.status === 'pending' && isExpired(invite.expires_at) && (
                  <Badge variant="destructive">Expired</Badge>
                )}
              </div>

              {invite.message && (
                <p className="text-sm text-muted-foreground italic">
                  "{invite.message}"
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Sent {getTimeAgo(invite.created_at)}</span>
                {invite.status === 'pending' && (
                  <span>
                    Expires {getTimeAgo(invite.expires_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {invite.status === 'pending' && !isExpired(invite.expires_at) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(invite.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelInvite(invite.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};