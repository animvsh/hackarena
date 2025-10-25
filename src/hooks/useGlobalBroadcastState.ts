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

export function useGlobalBroadcastState() {
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
      const { data, error } = await supabase
        .from('broadcast_state')
        .select('*')
        .single();

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
      .channel('broadcast-state-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcast_state',
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
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
  }, []);

  return {
    ...broadcastState,
    isLoading,
  };
}
