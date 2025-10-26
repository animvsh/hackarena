import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, RefreshCw, Shield, Unlink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GitHubData {
  github_verified?: boolean;
  github_username?: string | null;
  last_github_sync?: string | null;
}

interface GitHubConnectButtonProps {
  profile: GitHubData;
  onProfileUpdate?: (updatedProfile: Partial<GitHubData>) => void;
  onRefreshRepos?: () => void;
}

export const GitHubConnectButton = ({
  profile,
  onProfileUpdate,
  onRefreshRepos
}: GitHubConnectButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const isVerified = profile?.github_verified || false;
  const githubUsername = profile?.github_username;
  const lastSync = profile?.last_github_sync;

  const handleConnect = async () => {
    if (connecting) return; // Prevent double-click

    setConnecting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/github`,
          scopes: 'repo',
        },
      });

      if (error) {
        throw error;
      }

      toast.info('Redirecting to GitHub for authorization...', {
        duration: 3000,
      });

      // Keep connecting state true - user is being redirected
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('not configured') || errorMessage.includes('provider')) {
        toast.error('GitHub OAuth is not configured. Please contact support.', {
          duration: 10000,
        });
      } else {
        toast.error('Failed to connect to GitHub. Please try again.');
      }

      setConnecting(false);
    }
  };

  const handleResync = async () => {
    setSyncing(true);
    try {
      // Trigger refresh of repositories
      const syncTime = new Date().toISOString();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Update last sync time
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_github_sync: syncTime })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('GitHub repositories refreshed!');

      // Notify parent to refresh repos
      onRefreshRepos?.();
      onProfileUpdate?.({ last_github_sync: syncTime });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to refresh repositories: ${errorMessage}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({
          github_id: null,
          github_username: null,
          github_access_token: null,
          github_verified: false,
          github_url: null,
          last_github_sync: null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('GitHub account disconnected');
      onProfileUpdate?.({
        github_verified: false,
        github_username: null,
        last_github_sync: null,
      });
      setShowDisconnect(false);
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast.error('Failed to disconnect GitHub');
    }
  };

  if (isVerified) {
    return (
      <>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="w-3 h-3" />
            GitHub Connected
          </Badge>
          {githubUsername && (
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              @{githubUsername}
            </a>
          )}
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Last synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
            </span>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleResync}
              disabled={syncing}
              size="sm"
              variant="outline"
            >
              {syncing ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Refresh Repos
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowDisconnect(true)}
              size="sm"
              variant="outline"
            >
              <Unlink className="w-3 h-3 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>

        <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your GitHub connection and you won't be able to select repositories from the dropdown.
                You can reconnect at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDisconnect}>
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      size="sm"
      variant="default"
    >
      {connecting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Github className="w-4 h-4 mr-2" />
          Connect GitHub
        </>
      )}
    </Button>
  );
};
