import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BroadcastScene } from '@/types/broadcast';

export type BroadcastState = 'splash' | 'live' | 'commercial' | 'transitioning';

interface GlobalBroadcastState {
  state: BroadcastState;
  currentScene: BroadcastScene;
  currentSegmentId: string | null;
  commentaryIndex: number;
  phase: string | null;
  liveViewerCount: number;
}

export function useGlobalBroadcastState(hackathonId?: string) {
  const [broadcastState, setBroadcastState] = useState<GlobalBroadcastState>({
    state: 'live',
    currentScene: 'anchor',
    currentSegmentId: null,
    commentaryIndex: 0,
    phase: 'CONTENT_DELIVERY',
    liveViewerCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial state
    const fetchInitialState = async () => {
      let query = supabase.from('broadcast_state').select('*');
      
      if (hackathonId) {
        query = query.eq('hackathon_id', hackathonId);
      }
      
      const { data, error } = await query.maybeSingle();

      if (data && !error) {
        setBroadcastState({
          state: data.state as BroadcastState,
          currentScene: data.current_scene as BroadcastScene,
          currentSegmentId: data.current_segment_id,
          commentaryIndex: data.commentary_index || 0,
          phase: data.phase,
          liveViewerCount: data.live_viewer_count || 0,
        });
      }
      setIsLoading(false);
    };

    fetchInitialState();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`broadcast-state-changes-${hackathonId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcast_state',
          filter: hackathonId ? `hackathon_id=eq.${hackathonId}` : undefined,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData && (!hackathonId || newData.hackathon_id === hackathonId)) {
            setBroadcastState({
              state: newData.state as BroadcastState,
              currentScene: newData.current_scene as BroadcastScene,
              currentSegmentId: newData.current_segment_id,
              commentaryIndex: newData.commentary_index || 0,
              phase: newData.phase,
              liveViewerCount: newData.live_viewer_count || 0,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId]);

  return {
    ...broadcastState,
    isLoading,
  };
}
