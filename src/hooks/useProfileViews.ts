import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useProfileViews(profileUserId: string | undefined) {
  const [viewCount, setViewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileUserId) {
      setLoading(false);
      return;
    }

    const fetchViewCount = async () => {
      try {
        // Get view count for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count, error } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_user_id', profileUserId)
          .gte('viewed_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        setViewCount(count || 0);
      } catch (error) {
        console.error('Error fetching profile views:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewCount();
  }, [profileUserId]);

  const trackView = async (viewerUserId?: string) => {
    if (!profileUserId || profileUserId === viewerUserId) return;

    try {
      await supabase.from('profile_views').insert({
        profile_user_id: profileUserId,
        viewer_user_id: viewerUserId || null,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  return { viewCount, loading, trackView };
}
