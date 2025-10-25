import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BroadcastContent } from '@/types/broadcast';

export function useBroadcastContent() {
  const [content, setContent] = useState<BroadcastContent[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Fetch initial commentary
    const fetchInitialContent = async () => {
      const { data, error } = await supabase
        .from('commentary_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        const formattedContent: BroadcastContent[] = data.map((item) => ({
          id: item.id,
          teamName: item.voice_persona || 'Team',
          narrative: item.text,
          metricType: item.event_type || 'update',
          currentValue: 0,
          change: 0,
          priority: 'normal',
          timestamp: item.created_at,
        }));
        setContent(formattedContent);
      }
    };

    fetchInitialContent();

    // Subscribe to new commentary
    const channel = supabase
      .channel('broadcast-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commentary_feed',
        },
        (payload) => {
          const newItem = payload.new as any;
          const newContent: BroadcastContent = {
            id: newItem.id,
            teamName: newItem.voice_persona || 'Team',
            narrative: newItem.text,
            metricType: newItem.event_type || 'update',
            currentValue: 0,
            change: 0,
            priority: 'normal',
            timestamp: newItem.created_at,
          };
          setContent((prev) => [newContent, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { content, isLive };
}
