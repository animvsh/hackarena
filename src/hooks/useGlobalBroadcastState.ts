import { useState, useEffect, useCallback } from 'react';
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
  isPaused: boolean;
  pausedByUserId: string | null;
  pausedAt: string | null;
}

const MASTER_USER_EMAIL = 'aalang@ucsc.edu';

export function useGlobalBroadcastState(hackathonId?: string) {
  const [broadcastState, setBroadcastState] = useState<GlobalBroadcastState>({
    state: 'live',
    currentScene: 'anchor',
    currentSegmentId: null,
    commentaryIndex: 0,
    phase: 'CONTENT_DELIVERY',
    liveViewerCount: 0,
    isPaused: false,
    pausedByUserId: null,
    pausedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMasterUser, setIsMasterUser] = useState(false);

  useEffect(() => {
    // Check if current user is master user
    const checkMasterUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === MASTER_USER_EMAIL) {
        setIsMasterUser(true);
      }
    };

    checkMasterUser();

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
          isPaused: data.is_paused || false,
          pausedByUserId: data.paused_by_user_id || null,
          pausedAt: data.paused_at || null,
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
              isPaused: newData.is_paused || false,
              pausedByUserId: newData.paused_by_user_id || null,
              pausedAt: newData.paused_at || null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId]);

  const pauseBroadcast = useCallback(async () => {
    if (!isMasterUser) {
      console.error('Only master user can pause broadcast');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from('broadcast_state').update({
      is_paused: true,
      paused_by_user_id: user.id,
      paused_at: new Date().toISOString(),
    });

    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    } else {
      // Update all broadcast states if no specific hackathon
      query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
    }

    const { error } = await query;

    if (error) {
      console.error('Failed to pause broadcast:', error);
    }
  }, [isMasterUser, hackathonId]);

  const resumeBroadcast = useCallback(async () => {
    if (!isMasterUser) {
      console.error('Only master user can resume broadcast');
      return;
    }

    let query = supabase.from('broadcast_state').update({
      is_paused: false,
      paused_by_user_id: null,
      paused_at: null,
    });

    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    } else {
      // Update all broadcast states if no specific hackathon
      query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
    }

    const { error } = await query;

    if (error) {
      console.error('Failed to resume broadcast:', error);
    }
  }, [isMasterUser, hackathonId]);

  const togglePause = useCallback(async () => {
    if (broadcastState.isPaused) {
      await resumeBroadcast();
    } else {
      await pauseBroadcast();
    }
  }, [broadcastState.isPaused, pauseBroadcast, resumeBroadcast]);

  return {
    ...broadcastState,
    isLoading,
    isMasterUser,
    pauseBroadcast,
    resumeBroadcast,
    togglePause,
  };
}
