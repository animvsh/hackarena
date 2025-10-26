import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface InviteToTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserEmail: string;
  targetUsername: string;
}

export function InviteToTeamModal({
  open,
  onOpenChange,
  targetUserId,
  targetUserEmail,
  targetUsername,
}: InviteToTeamModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(true);

  useEffect(() => {
    if (open) {
      fetchOwnedTeams();
      setMessage(`Hi ${targetUsername}, I'd like to invite you to join our team!`);
    }
  }, [open, targetUsername]);

  const fetchOwnedTeams = async () => {
    setFetchingTeams(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teams where user is owner or has can_manage_members permission
      const { data, error } = await supabase
        .from('team_permissions')
        .select(`
          team_id,
          teams (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .or('role.eq.owner,can_manage_members.eq.true');

      if (error) throw error;

      // Filter out teams where target user is already a member
      const teamIds = data?.map(d => d.team_id) || [];
      
      const { data: existingMemberships } = await supabase
        .from('team_permissions')
        .select('team_id')
        .eq('user_id', targetUserId)
        .in('team_id', teamIds);

      const existingTeamIds = new Set(existingMemberships?.map(m => m.team_id) || []);
      
      const availableTeams = data
        ?.filter(d => !existingTeamIds.has(d.team_id))
        .map(d => d.teams)
        .filter(Boolean) as Team[];

      setTeams(availableTeams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setFetchingTeams(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedTeamId) {
      toast.error('Please select a team');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the invite-team-member edge function
      const { error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          teamId: selectedTeamId,
          invitedUserId: targetUserId,
          inviteEmail: targetUserEmail,
          message,
        },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${targetUsername}`);
      onOpenChange(false);
      setSelectedTeamId('');
      setMessage('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite {targetUsername} to Team</DialogTitle>
          <DialogDescription>
            Send a team invitation to collaborate together
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Select Team</Label>
            {fetchingTeams ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don't have any teams available to invite this user to.
              </p>
            ) : (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading || !selectedTeamId || teams.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
