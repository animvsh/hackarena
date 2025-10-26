import { useState, useCallback } from 'react';
import type { BroadcastEvent, FillerContent, BroadcastQueueItem } from '@/types/broadcastEvent';

export function useBroadcastQueue() {
  const [realEventsQueue, setRealEventsQueue] = useState<BroadcastQueueItem[]>([]);
  const [fillerQueue, setFillerQueue] = useState<BroadcastQueueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<BroadcastQueueItem | null>(null);

  const addRealEvent = useCallback((event: BroadcastEvent, generatedContent: {
    text: string;
    content_type: 'commentary' | 'ticker' | 'banner';
    duration: number;
  }) => {
    const queueItem: BroadcastQueueItem = {
      id: event.id,
      content_type: generatedContent.content_type,
      text: generatedContent.text,
      team_name: event.teamName,
      priority: event.priority,
      duration: generatedContent.duration,
      isRealEvent: true,
      created_at: event.timestamp
    };

    setRealEventsQueue(prev => {
      // Breaking news interrupts immediately
      if (event.priority === 'breaking') {
        return [queueItem, ...prev];
      }
      // Normal events added to end
      return [...prev, queueItem];
    });

    // If breaking news, interrupt current item
    if (event.priority === 'breaking' && currentItem) {
      setCurrentItem(null);
    }
  }, [currentItem]);

  const addFillerContent = useCallback((filler: FillerContent) => {
    const queueItem: BroadcastQueueItem = {
      id: filler.id,
      content_type: 'commentary',
      text: filler.text,
      team_name: filler.teamName,
      priority: filler.priority,
      duration: 8000,
      isRealEvent: false,
      created_at: filler.timestamp
    };

    setFillerQueue(prev => [...prev, queueItem]);
  }, []);

  const getNext = useCallback((): BroadcastQueueItem | null => {
    // Always prioritize real events
    if (realEventsQueue.length > 0) {
      const next = realEventsQueue[0];
      setRealEventsQueue(prev => prev.slice(1));
      setCurrentItem(next);
      return next;
    }

    // Fall back to filler content
    if (fillerQueue.length > 0) {
      const next = fillerQueue[0];
      setFillerQueue(prev => prev.slice(1));
      setCurrentItem(next);
      return next;
    }

    setCurrentItem(null);
    return null;
  }, [realEventsQueue, fillerQueue]);

  const clearFiller = useCallback(() => {
    setFillerQueue([]);
  }, []);

  const hasRealEvents = realEventsQueue.length > 0;
  const hasContent = realEventsQueue.length > 0 || fillerQueue.length > 0;

  return {
    addRealEvent,
    addFillerContent,
    getNext,
    clearFiller,
    hasRealEvents,
    hasContent,
    currentItem,
    queueLength: realEventsQueue.length + fillerQueue.length
  };
}
