import { useEffect, useRef } from 'react';

const AUTO_PAUSE_DELAY = 30000; // 30 seconds after last viewer leaves

interface UseAutoPauseOnNoViewersProps {
  viewerCount: number;
  isPaused: boolean;
  isPausedBySystem: boolean;
  autoPauseEnabled: boolean;
  isMasterUser: boolean;
  onSystemPause: () => void;
  onSystemResume: () => void;
}

export function useAutoPauseOnNoViewers({
  viewerCount,
  isPaused,
  isPausedBySystem,
  autoPauseEnabled,
  isMasterUser,
  onSystemPause,
  onSystemResume,
}: UseAutoPauseOnNoViewersProps) {
  const autoPauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousViewerCountRef = useRef(viewerCount);

  useEffect(() => {
    // Clear any existing timer
    if (autoPauseTimerRef.current) {
      clearTimeout(autoPauseTimerRef.current);
      autoPauseTimerRef.current = null;
    }

    // Only auto-pause if feature is enabled and not manually paused
    if (!autoPauseEnabled) {
      console.log('[useAutoPauseOnNoViewers] Auto-pause disabled');
      return;
    }

    // Viewer count went from >0 to 0
    if (viewerCount === 0 && previousViewerCountRef.current > 0) {
      console.log('[useAutoPauseOnNoViewers] Last viewer left, starting 30s countdown');
      
      // Start countdown to auto-pause
      autoPauseTimerRef.current = setTimeout(() => {
        // Double-check viewer count is still 0
        if (viewerCount === 0 && !isPaused) {
          console.log('[useAutoPauseOnNoViewers] Auto-pausing broadcast (no viewers for 30s)');
          onSystemPause();
        }
      }, AUTO_PAUSE_DELAY);
    }
    // Viewer count went from 0 to >0
    else if (viewerCount > 0 && previousViewerCountRef.current === 0) {
      console.log('[useAutoPauseOnNoViewers] First viewer joined');
      
      // If broadcast was system-paused, auto-resume
      if (isPausedBySystem) {
        console.log('[useAutoPauseOnNoViewers] Auto-resuming broadcast (viewer joined)');
        onSystemResume();
      }
    }

    previousViewerCountRef.current = viewerCount;

    return () => {
      if (autoPauseTimerRef.current) {
        clearTimeout(autoPauseTimerRef.current);
        autoPauseTimerRef.current = null;
      }
    };
  }, [viewerCount, isPaused, isPausedBySystem, autoPauseEnabled, onSystemPause, onSystemResume]);

  return {
    isCountingDown: autoPauseTimerRef.current !== null,
  };
}
