import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Github, Loader2, ExternalLink, Save, Edit2 } from 'lucide-react';
import { GitHubConnectButton } from './GitHubConnectButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
}

interface GitHubRepoInputProps {
  teamId: string;
  currentRepo?: string | null;
  isOwner: boolean;
}

export function GitHubRepoInput({ teamId, currentRepo, isOwner }: GitHubRepoInputProps) {
  const [editing, setEditing] = useState(!currentRepo);
  const [selectedRepoUrl, setSelectedRepoUrl] = useState(currentRepo || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [githubProfile, setGithubProfile] = useState<any>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    fetchGitHubProfile();
  }, []);

  useEffect(() => {
    if (githubProfile?.github_verified && editing) {
      fetchRepositories();
    }
  }, [githubProfile, editing]);

  const fetchGitHubProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('github_verified, github_username, last_github_sync')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setGithubProfile(data);
    } catch (error) {
      console.error('Error fetching GitHub profile:', error);
    }
  };

  const fetchRepositories = async () => {
    setLoading(true);
    setNeedsAuth(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-github-repos', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Handle authentication errors (token revoked/expired)
      if (data?.needsAuth || data?.code === 'TOKEN_REVOKED' || data?.code === 'GITHUB_NOT_CONNECTED') {
        setNeedsAuth(true);

        // Auto-refresh GitHub profile state
        await fetchGitHubProfile();

        toast.error(data.error || 'Please reconnect your GitHub account', {
          duration: 5000,
        });
        return;
      }

      // Handle rate limiting
      if (data?.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error(data.error || 'GitHub API rate limit exceeded. Please try again later.', {
          duration: 10000,
        });
        return;
      }

      // Handle timeout errors
      if (data?.code === 'GATEWAY_TIMEOUT') {
        toast.error('Request timeout. GitHub may be experiencing issues. Please try again.', {
          duration: 5000,
        });
        return;
      }

      // Handle other errors
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.repos) {
        setRepos(data.repos);

        if (data.hasMore) {
          toast.info('Showing first 1000 repositories. Use search to find more specific repos.', {
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching repositories:', error);

      // User-friendly error messages
      const errorMessage = error.message || 'Failed to load repositories';

      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRepoUrl) {
      toast.error('Please select a repository');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ github_repo: selectedRepoUrl })
        .eq('id', teamId);

      if (error) throw error;

      toast.success('GitHub repository updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating GitHub repo:', error);
      toast.error('Failed to update GitHub repository');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshRepos = () => {
    fetchRepositories();
  };

  if (!isOwner && !currentRepo) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Github className="h-4 w-4" />
        No GitHub repository connected
      </div>
    );
  }

  if (!isOwner && currentRepo) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub Repository
        </Label>
        <a
          href={currentRepo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          {currentRepo}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  // Team owner view
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="github-repo" className="flex items-center gap-2 mb-2">
          <Github className="h-4 w-4" />
          GitHub Repository
        </Label>

        {/* GitHub Connect/Status */}
        <GitHubConnectButton
          profile={githubProfile || {}}
          onProfileUpdate={(updated) => setGithubProfile({ ...githubProfile, ...updated })}
          onRefreshRepos={handleRefreshRepos}
        />
      </div>

      {githubProfile?.github_verified && (
        <>
          {editing ? (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading repositories...
                </div>
              ) : needsAuth ? (
                <div className="text-sm text-muted-foreground">
                  Please reconnect your GitHub account to see repositories
                </div>
              ) : repos.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No repositories found. Create one on GitHub first.
                </div>
              ) : (
                <>
                  <Select value={selectedRepoUrl} onValueChange={setSelectedRepoUrl}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repos.map((repo) => (
                        <SelectItem key={repo.id} value={repo.url}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{repo.name}</span>
                            {repo.private && (
                              <span className="text-xs text-muted-foreground">(Private)</span>
                            )}
                          </div>
                          {repo.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {repo.description}
                            </div>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs text-muted-foreground">
                    Don't see your repo?{' '}
                    <a
                      href="https://github.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Create a new repository on GitHub
                    </a>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !selectedRepoUrl || (selectedRepoUrl === currentRepo)}
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
                {currentRepo && (
                  <Button
                    onClick={() => {
                      setSelectedRepoUrl(currentRepo);
                      setEditing(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : currentRepo ? (
            <div className="flex items-center gap-2">
              <a
                href={currentRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline flex-1"
              >
                {currentRepo.split('/').slice(-1)[0]}
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              size="sm"
            >
              Select Repository
            </Button>
          )}
        </>
      )}
    </div>
  );
}
