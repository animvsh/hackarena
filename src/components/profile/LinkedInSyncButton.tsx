import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, RefreshCw, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface LinkedInSyncButtonProps {
  isVerified: boolean;
  linkedinId?: string | null;
  lastSync?: string | null;
  onSyncComplete?: () => void;
}

export const LinkedInSyncButton = ({
  isVerified,
  linkedinId,
  lastSync,
  onSyncComplete
}: LinkedInSyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);

  const handleVerify = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/linkedin`,
          scopes: 'openid profile email',
        },
      });

      if (error) {
        throw error;
      }

      toast.info('Redirecting to LinkedIn...');
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      toast.error('Failed to connect to LinkedIn');
    }
  };

  const handleResync = async () => {
    if (!linkedinId) {
      toast.error('No LinkedIn account connected');
      return;
    }

    setSyncing(true);
    try {
      // Get the current user's LinkedIn URL from their profile
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('users')
        .select('linkedin_url')
        .eq('id', user.id)
        .single();

      if (!profile?.linkedin_url) {
        throw new Error('No LinkedIn URL found');
      }

      // Call the import function to re-scrape the profile
      const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
        body: { linkedinUrl: profile.linkedin_url },
      });

      if (error) {
        throw error;
      }

      // Update the user's profile with the new data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          bio: data.profile.bio,
          skills: data.profile.skills,
          experience: data.profile.experience,
          education: data.profile.education,
          last_profile_sync: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile synced successfully!');
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync LinkedIn profile');
    } finally {
      setSyncing(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <Shield className="w-3 h-3" />
          LinkedIn Verified
        </Badge>
        {lastSync && (
          <span className="text-xs text-muted-foreground">
            Last synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
          </span>
        )}
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
              Re-sync Profile
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleVerify}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Linkedin className="w-4 h-4 mr-2" />
      Verify with LinkedIn
    </Button>
  );
};
