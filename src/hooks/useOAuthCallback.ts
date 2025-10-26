import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOAuthCallback() {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const provider = session.user.app_metadata.provider;

        if (provider === 'github' && session.user.user_metadata.user_name) {
          const githubUsername = session.user.user_metadata.user_name;
          const githubUrl = `https://github.com/${githubUsername}`;

          await supabase
            .from('users')
            .update({
              github_url: githubUrl,
              profile_enrichment_source: 'github'
            })
            .eq('id', session.user.id);

          toast.success('GitHub account connected successfully!');
        } else if (provider === 'linkedin_oidc') {
          // Extract LinkedIn data from OAuth metadata
          const linkedinId = session.user.user_metadata.sub || '';
          const linkedinUrl = session.user.user_metadata.profile_url ||
                             session.user.user_metadata.linkedin_url || '';
          const email = session.user.email;

          if (linkedinId) {
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

              try {
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
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`LinkedIn verified, but profile import failed: ${errorMessage}. You can manually sync later.`, {
                  id: 'linkedin-import',
                  duration: 6000
                });

                // Still save the LinkedIn URL even if scraping fails
                await supabase
                  .from('users')
                  .update({ linkedin_url: linkedinUrl })
                  .eq('id', session.user.id);
              }
            } else {
              toast.success('LinkedIn account verified successfully!');
            }
          }
        }
      }
    };

    handleOAuthCallback();
  }, []);
}
