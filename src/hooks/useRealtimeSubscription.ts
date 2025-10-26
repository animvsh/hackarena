import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  channelName: string;
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  onUpdate: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  channelName,
  table,
  event = '*',
  schema = 'public',
  onUpdate,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create and subscribe to channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
        } as any,
        onUpdate
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName, table, event, schema, enabled]);

  return null;
}
