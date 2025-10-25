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
            .update({ github_url: githubUrl })
            .eq('id', session.user.id);
          
          toast.success('GitHub account connected successfully!');
        } else if (provider === 'linkedin_oidc') {
          const linkedinUrl = session.user.user_metadata.sub || '';
          
          if (linkedinUrl) {
            await supabase
              .from('users')
              .update({ linkedin_url: linkedinUrl })
              .eq('id', session.user.id);
            
            toast.success('LinkedIn account connected successfully!');
          }
        }
      }
    };

    handleOAuthCallback();
  }, []);
}
