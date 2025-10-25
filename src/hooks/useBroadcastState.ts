import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

export type BroadcastState = 'splash' | 'live' | 'commercial' | 'transitioning';

export function useBroadcastState() {
  const [broadcastState, setBroadcastState] = useState<BroadcastState>('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fromScene, setFromScene] = useState<BroadcastScene | null>(null);
  const [toScene, setToScene] = useState<BroadcastScene>('anchor');

  // Auto-start broadcast after splash
  useEffect(() => {
    if (broadcastState === 'splash') {
      // Splash screen will call goLive when ready
    }
  }, [broadcastState]);

  const goLive = () => {
    setBroadcastState('live');
  };

  const startCommercialBreak = () => {
    setBroadcastState('commercial');
  };

  const endCommercialBreak = () => {
    setBroadcastState('live');
  };

  const startTransition = (from: BroadcastScene, to: BroadcastScene) => {
    setFromScene(from);
    setToScene(to);
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
    setFromScene(null);
  };

  return {
    broadcastState,
    isTransitioning,
    fromScene,
    toScene,
    goLive,
    startCommercialBreak,
    endCommercialBreak,
    startTransition,
    endTransition,
  };
}
