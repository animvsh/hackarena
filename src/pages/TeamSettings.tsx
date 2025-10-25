import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Settings, 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  Key, 
  Clock,
  CheckCircle2,
  XCircle,
  Mail
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { InviteMemberButton } from '@/components/teams/InviteMemberButton';
import { TeamInviteCard } from '@/components/teams/TeamInviteCard';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  can_manage_members: boolean;
  users: {
    username: string;
    avatar_url: string | null;
    email: string;
  };
}

interface JoinRequest {
  id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  users: {
    username: string;
    avatar_url: string | null;
    email: string;
  };
}

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

export default function TeamSettings() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (teamId && user) {
      fetchTeamData();
      subscribeToUpdates();
    }
  }, [teamId, user]);

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`team-${teamId}-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchJoinRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_permissions',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTeamData = async () => {
    setLoading(true);
    
    // Fetch team basic info
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamData) {
      setTeam(teamData);
      setInviteCode(teamData.invite_code || '');
    }

    // Check user permissions
    const { data: permission } = await supabase
      .from('team_permissions')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user?.id)
      .single();

    if (permission) {
      setCanManage(permission.role === 'owner' || permission.can_manage_members);
    }

    await fetchMembers();
    await fetchJoinRequests();
    await fetchTeamInvites();
    
    setLoading(false);
  };

  const fetchTeamInvites = async () => {
    const { data } = await supabase
      .from('team_invites')
      .select(`
        *,
        users:invited_user_id (
          username,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (data) {
      setTeamInvites(data as any);
    }
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('team_permissions')
      .select(`
        *,
        users (
          username,
          avatar_url,
          email
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (data) {
      setMembers(data as any);
    }
  };

  const fetchJoinRequests = async () => {
    const { data } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        users (
          username,
          avatar_url,
          email
        )
      `)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      setJoinRequests(data as any);
    }
  };

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite code');
    }
  };

  const handleManageRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    
    setProcessingRequest(requestId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-join-request', {
        body: {
          requestId,
          action,
          reviewerId: user.id,
        },
      });

      if (error) throw error;

      toast.success(action === 'approve' ? 'Member added to team!' : 'Request rejected');
      fetchJoinRequests();
      if (action === 'approve') {
        fetchMembers();
      }
    } catch (error: any) {
      console.error('Error managing request:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to manage this team
            </p>
            <Button onClick={() => navigate('/teams')}>
              Back to Teams
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">{team?.name} Settings</h1>
            </div>
            <InviteMemberButton teamId={teamId!} teamName={team?.name || 'Team'} />
          </div>
          <p className="text-muted-foreground">
            Manage your team members and settings
          </p>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Join Requests
              {joinRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {joinRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invitations
              {teamInvites.filter(i => i.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {teamInvites.filter(i => i.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Invite Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  All members with access to this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.users.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.users.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.users.username}</p>
                          <p className="text-sm text-muted-foreground">{member.users.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        {member.can_manage_members && (
                          <Badge variant="outline">Can Manage</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Join Requests</CardTitle>
                <CardDescription>
                  Review requests from users who want to join your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending join requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar>
                            <AvatarImage src={request.users.avatar_url || undefined} />
                            <AvatarFallback>
                              {request.users.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{request.users.username}</p>
                            <p className="text-sm text-muted-foreground mb-2">{request.users.email}</p>
                            {request.message && (
                              <p className="text-sm bg-muted p-2 rounded">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Requested {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleManageRequest(request.id, 'approve')}
                            disabled={processingRequest === request.id}
                          >
                            {processingRequest === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageRequest(request.id, 'reject')}
                            disabled={processingRequest === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Team Invitations</CardTitle>
                <CardDescription>
                  View and manage invitations you've sent to join your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamInviteCard invites={teamInvites} onRefresh={fetchTeamInvites} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Team Invite Code</CardTitle>
                <CardDescription>
                  Share this code with people you want to invite to your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    readOnly
                    className="flex-1 px-4 py-2 bg-muted rounded-lg font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyInviteCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">How to use:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Share this invite code with your team members</li>
                    <li>They enter it during onboarding or on the teams page</li>
                    <li>You'll receive a notification to approve their request</li>
                    <li>Once approved, they'll have access to your team</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
