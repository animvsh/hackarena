import { createContext, useContext, ReactNode } from 'react';
import { useGlobalBroadcastState } from '@/hooks/useGlobalBroadcastState';

interface BroadcastPauseContextType {
  isPaused: boolean;
  pausedAt: string | null;
  isMasterUser: boolean;
  pauseBroadcast: () => Promise<void>;
  resumeBroadcast: () => Promise<void>;
  togglePause: () => Promise<void>;
}

const BroadcastPauseContext = createContext<BroadcastPauseContextType | null>(null);

export function BroadcastPauseProvider({ children, hackathonId }: { children: ReactNode; hackathonId?: string }) {
  const pauseState = useGlobalBroadcastState(hackathonId);
  
  return (
    <BroadcastPauseContext.Provider value={pauseState}>
      {children}
    </BroadcastPauseContext.Provider>
  );
}

export function useBroadcastPause() {
  const context = useContext(BroadcastPauseContext);
  if (!context) {
    throw new Error('useBroadcastPause must be used within BroadcastPauseProvider');
  }
  return context;
}
