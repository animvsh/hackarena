import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

type CallbackState = 'processing' | 'success' | 'error';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error('No session found. Please try connecting again.');
        }

        const provider = session.user.app_metadata.provider;

        if (provider === 'github') {
          const githubId = session.user.user_metadata.user_id ||
                          session.user.user_metadata.sub || '';
          const githubUsername = session.user.user_metadata.user_name ||
                                session.user.user_metadata.preferred_username || '';
          const email = session.user.email;

          // Get the provider token (GitHub access token)
          const providerToken = session.provider_token;

          if (!githubId) {
            throw new Error('GitHub ID not found in OAuth response');
          }

          if (!providerToken) {
            throw new Error('GitHub access token not found. Please try reconnecting your GitHub account.');
          }

          // SECURITY: Validate token by testing it with GitHub API
          toast.loading('Validating GitHub connection...', { id: 'github-validate' });

          const validateResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${providerToken}`,
              'Accept': 'application/vnd.github+json',
            },
          });

          if (!validateResponse.ok) {
            console.error('Token validation failed:', validateResponse.status);
            throw new Error('Failed to validate GitHub token. Please try again.');
          }

          const githubUser = await validateResponse.json();

          // Verify the token has the required 'repo' scope
          const scopes = validateResponse.headers.get('x-oauth-scopes') || '';
          if (!scopes.includes('repo')) {
            throw new Error('GitHub token is missing required "repo" scope. Please reconnect and grant repository access.');
          }

          toast.dismiss('github-validate');

          // Use the verified username from GitHub API (more reliable than OAuth metadata)
          const verifiedUsername = githubUser.login || githubUsername;

          // Update user with GitHub ID, username, token, and verification status
          const { error: updateError } = await supabase
            .from('users')
            .update({
              github_id: githubId,
              github_username: verifiedUsername,
              github_access_token: providerToken,
              github_verified: true,
              github_url: `https://github.com/${verifiedUsername}`,
              email: email || session.user.email,
              last_github_sync: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating user GitHub data:', updateError);
            throw new Error('Failed to save GitHub connection. Please try again.');
          }

          toast.success(`GitHub account @${verifiedUsername} connected successfully!`);
          setState('success');

          // Force AuthContext to refresh by triggering auth state change
          await supabase.auth.refreshSession();

          // Redirect after showing success
          setTimeout(() => {
            navigate('/profile/edit', { replace: true });
          }, 2000);
        } else {
          throw new Error('Not a GitHub OAuth callback');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(errorMsg);
        setState('error');
        toast.error(`GitHub connection failed: ${errorMsg}`, {
          duration: 5000
        });
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (state === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">Connecting your GitHub account...</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your identity
          </p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">GitHub Connected Successfully!</h2>
          <p className="text-muted-foreground">
            Your GitHub account has been verified. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <XCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Connection Failed</h2>
        <p className="text-muted-foreground">
          {errorMessage || 'Failed to connect your GitHub account'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate('/profile/edit')} variant="default">
            <Github className="w-4 h-4 mr-2" />
            Return to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
