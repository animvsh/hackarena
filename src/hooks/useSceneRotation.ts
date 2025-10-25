import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

export function useSceneRotation(interval = 30000) {
  const scenes: BroadcastScene[] = ['anchor', 'team', 'market', 'stats', 'highlight'];
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, scenes.length]);

  return { 
    currentScene: scenes[currentSceneIndex],
    sceneIndex: currentSceneIndex,
    totalScenes: scenes.length
  };
}
