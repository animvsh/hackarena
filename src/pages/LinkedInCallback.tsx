import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CallbackState = 'processing' | 'success' | 'error';

export default function LinkedInCallback() {
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

        if (provider === 'linkedin_oidc') {
          const linkedinId = session.user.user_metadata.sub || '';
          const linkedinUrl = session.user.user_metadata.profile_url ||
                             session.user.user_metadata.linkedin_url || '';
          const email = session.user.email;

          if (!linkedinId) {
            throw new Error('LinkedIn ID not found');
          }

          // Update user with LinkedIn ID and verification status
          await supabase
            .from('users')
            .update({
              linkedin_id: linkedinId,
              linkedin_verified: true,
              email: email || session.user.email,
            })
            .eq('id', session.user.id);

          // Auto-scrape LinkedIn profile if we have a URL
          if (linkedinUrl) {
            toast.loading('Importing your LinkedIn profile...', { id: 'linkedin-import' });

            const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
              body: { linkedinUrl, linkedinId },
            });

            if (error) {
              throw error;
            }

            if (data?.profile) {
              // Auto-populate user profile with scraped data
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  bio: data.profile.bio,
                  skills: data.profile.skills,
                  experience: data.profile.experience,
                  education: data.profile.education,
                  linkedin_url: linkedinUrl,
                  portfolio_url: data.profile.portfolio_url || null,
                  profile_enrichment_source: 'linkedin',
                  last_profile_sync: new Date().toISOString(),
                })
                .eq('id', session.user.id);

              if (updateError) {
                throw updateError;
              }

              toast.success('LinkedIn profile imported and verified!', { id: 'linkedin-import' });

              // Show summary of what was populated
              const populatedFields = [];
              if (data.profile.bio) populatedFields.push('bio');
              if (data.profile.skills?.length) populatedFields.push(`${data.profile.skills.length} skills`);
              if (data.profile.experience?.length) populatedFields.push(`${data.profile.experience.length} experiences`);
              if (data.profile.education?.length) populatedFields.push(`${data.profile.education.length} education entries`);

              if (populatedFields.length > 0) {
                toast.info(`Populated: ${populatedFields.join(', ')}`, { duration: 5000 });
              }
            } else {
              throw new Error('No profile data returned');
            }
          } else {
            toast.success('LinkedIn account verified successfully!');
          }

          setState('success');

          // Redirect after showing success
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          throw new Error('Not a LinkedIn OAuth callback');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(errorMsg);
        setState('error');
        toast.error(`LinkedIn verification failed: ${errorMsg}`, {
          id: 'linkedin-import',
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
          <h2 className="text-xl font-semibold">Connecting your LinkedIn account...</h2>
          <p className="text-muted-foreground">
            Please wait while we import your profile data
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
          <h2 className="text-xl font-semibold">LinkedIn Connected Successfully!</h2>
          <p className="text-muted-foreground">
            Your profile has been imported. Redirecting...
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
          {errorMessage || 'Failed to connect your LinkedIn account'}
        </p>
        <Button onClick={() => navigate('/')} variant="default">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
