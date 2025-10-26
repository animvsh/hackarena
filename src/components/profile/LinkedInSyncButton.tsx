import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, RefreshCw, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProfileData {
  linkedin_verified?: boolean;
  linkedin_id?: string | null;
  linkedin_url?: string | null;
  last_profile_sync?: string | null;
}

interface LinkedInSyncButtonProps {
  profile: ProfileData;
  onProfileUpdate?: (updatedProfile: Partial<ProfileData>) => void;
}

export const LinkedInSyncButton = ({
  profile,
  onProfileUpdate
}: LinkedInSyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const isVerified = profile?.linkedin_verified || false;
  const linkedinId = profile?.linkedin_id;
  const lastSync = profile?.last_profile_sync;

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
      toast.error('Failed to connect to LinkedIn. Please try again.');
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

      const { data: profileData } = await supabase
        .from('users')
        .select('linkedin_url')
        .eq('id', user.id)
        .single();

      if (!profileData?.linkedin_url) {
        throw new Error('No LinkedIn URL found');
      }

      // Call the import function to re-scrape the profile
      const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
        body: { linkedinUrl: profileData.linkedin_url },
      });

      if (error) {
        throw error;
      }

      const syncTime = new Date().toISOString();

      // Update the user's profile with the new data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          bio: data.profile.bio,
          skills: data.profile.skills,
          experience: data.profile.experience,
          education: data.profile.education,
          last_profile_sync: syncTime,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile synced successfully!');

      // Call the callback with updated profile data
      onProfileUpdate?.({
        last_profile_sync: syncTime,
        ...data.profile
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to sync LinkedIn profile: ${errorMessage}`);
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
