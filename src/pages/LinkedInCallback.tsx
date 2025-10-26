import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CallbackState = 'processing' | 'needsUrl' | 'importing' | 'success' | 'error';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [linkedinId, setLinkedinId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const importLinkedInProfile = async (profileUrl: string, linkedInId: string, userId: string) => {
    try {
      setState('importing');
      toast.loading('Importing your LinkedIn profile...', { id: 'linkedin-import' });

      const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
        body: { linkedinUrl: profileUrl, linkedinId: linkedInId },
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
            linkedin_url: profileUrl,
            portfolio_url: data.profile.portfolio_url || null,
            profile_enrichment_source: 'linkedin',
            last_profile_sync: new Date().toISOString(),
          })
          .eq('id', userId);

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

        setState('success');

        // Force AuthContext to refresh by triggering auth state change
        await supabase.auth.refreshSession();

        // Redirect after showing success
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        throw new Error('No profile data returned from Clado API');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      setState('error');
      toast.error(`Profile import failed: ${errorMsg}`, {
        id: 'linkedin-import',
        duration: 5000
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) {
      toast.error('Please enter your LinkedIn profile URL');
      return;
    }
    await importLinkedInProfile(linkedinUrl, linkedinId, userId);
  };

  const handleSkipImport = () => {
    toast.info('You can import your LinkedIn profile later from your profile settings');
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error('No session found. Please try connecting again.');
        }

        const provider = session.user.app_metadata.provider;

        if (provider === 'linkedin_oidc') {
          const linkedInId = session.user.user_metadata.sub || '';
          const profileUrl = session.user.user_metadata.profile_url ||
                             session.user.user_metadata.linkedin_url ||
                             session.user.user_metadata.vanityName ?
                               `https://www.linkedin.com/in/${session.user.user_metadata.vanityName}` : '';
          const email = session.user.email;

          // Debug: Log what LinkedIn actually returns
          console.log('LinkedIn OAuth metadata:', {
            sub: linkedInId,
            profile_url: session.user.user_metadata.profile_url,
            linkedin_url: session.user.user_metadata.linkedin_url,
            vanityName: session.user.user_metadata.vanityName,
            email: email,
            allMetadata: session.user.user_metadata
          });

          if (!linkedInId) {
            throw new Error('LinkedIn ID not found');
          }

          // Store these for later use if we need manual URL entry
          setLinkedinId(linkedInId);
          setUserId(session.user.id);

          // Update user with LinkedIn ID and verification status
          await supabase
            .from('users')
            .update({
              linkedin_id: linkedInId,
              linkedin_verified: true,
              email: email || session.user.email,
            })
            .eq('id', session.user.id);

          toast.success('LinkedIn account verified successfully!');

          // If we have a profile URL, proceed with import
          if (profileUrl) {
            await importLinkedInProfile(profileUrl, linkedInId, session.user.id);
          } else {
            // No profile URL in metadata, need to ask user
            console.log('No LinkedIn profile URL found in OAuth metadata, requesting manual entry');
            setState('needsUrl');
          }
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
          <h2 className="text-xl font-semibold">Verifying your LinkedIn account...</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your identity
          </p>
        </div>
      </div>
    );
  }

  if (state === 'needsUrl') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Linkedin className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Import Your LinkedIn Profile</CardTitle>
            </div>
            <CardDescription>
              Enter your LinkedIn profile URL to automatically import your bio, skills, experience, and education.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your public LinkedIn profile URL (e.g., linkedin.com/in/yourname)
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleSkipImport} className="flex-1">
                  Skip for Now
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Linkedin className="w-4 h-4 mr-2" />
                  Import Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'importing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <h2 className="text-xl font-semibold">Importing your LinkedIn profile...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your profile data from LinkedIn
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
          <h2 className="text-xl font-semibold">LinkedIn Profile Imported Successfully!</h2>
          <p className="text-muted-foreground">
            Your profile has been verified and imported. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <XCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Import Failed</h2>
        <p className="text-muted-foreground">
          {errorMessage || 'Failed to import your LinkedIn profile'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleSkipImport} variant="outline">
            Skip for Now
          </Button>
          <Button onClick={() => navigate('/')} variant="default">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
