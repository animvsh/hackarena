import { useState, useEffect, useCallback } from 'react';
import type { BroadcastScene } from '@/types/broadcast';
import { useSegmentContent, type SegmentContent } from './useSegmentContent';

export type SegmentPhase = 'BUMPER_IN' | 'CONTENT_DELIVERY' | 'BUMPER_OUT' | 'TRANSITION';

export interface SegmentState {
  currentScene: BroadcastScene;
  phase: SegmentPhase;
  segmentContent: SegmentContent | null;
  currentCommentaryIndex: number;
  currentCommentary: string;
  activePersonality: 'left' | 'right';
  showBumper: boolean;
  isTransitioning: boolean;
  progressPercent: number;
}

const SCENE_SEQUENCE: BroadcastScene[] = ['anchor', 'team', 'market', 'stats', 'highlight'];
const BUMPER_IN_DURATION = 2500; // 2.5s
const BUMPER_OUT_DURATION = 1500; // 1.5s
const TRANSITION_DURATION = 1000; // 1s

export function useSegmentManager() {
  const { generateSegment, injectBreakingNews } = useSegmentContent();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState<SegmentPhase>('BUMPER_IN');
  const [segmentContent, setSegmentContent] = useState<SegmentContent | null>(null);
  const [currentCommentaryIndex, setCurrentCommentaryIndex] = useState(0);
  const [showBumper, setShowBumper] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentScene = SCENE_SEQUENCE[currentSceneIndex];

  // Initialize segment content when scene changes
  useEffect(() => {
    setIsInitializing(true);
    
    // Generate segment asynchronously
    const loadSegment = async () => {
      const content = await generateSegment(currentScene);
      setSegmentContent(content);
      setCurrentCommentaryIndex(0);
      setProgressPercent(0);
      // Allow state machine to run on next tick
      setTimeout(() => setIsInitializing(false), 0);
    };
    
    loadSegment();
  }, [currentScene, generateSegment]);

  // Segment flow state machine
  useEffect(() => {
    // Don't run while initializing new scene
    if (isInitializing) return;
    let timer: NodeJS.Timeout;

    switch (phase) {
      case 'BUMPER_IN':
        setShowBumper(true);
        timer = setTimeout(() => {
          setShowBumper(false);
          setPhase('CONTENT_DELIVERY');
        }, BUMPER_IN_DURATION);
        break;

      case 'CONTENT_DELIVERY':
        if (!segmentContent) break;
        
        const currentPiece = segmentContent.commentary[currentCommentaryIndex];
        if (!currentPiece) {
          // All commentary delivered, move to bumper out
          setPhase('BUMPER_OUT');
          break;
        }

        // Set timer for current commentary piece
        timer = setTimeout(() => {
          if (currentCommentaryIndex < segmentContent.commentary.length - 1) {
            setCurrentCommentaryIndex(prev => prev + 1);
            const elapsed = segmentContent.commentary
              .slice(0, currentCommentaryIndex + 2)
              .reduce((sum, piece) => sum + piece.duration, 0);
            setProgressPercent((elapsed / segmentContent.totalDuration) * 100);
          } else {
            // Last piece finished
            setProgressPercent(100);
            setPhase('BUMPER_OUT');
          }
        }, currentPiece.duration * 1000);
        break;

      case 'BUMPER_OUT':
        setShowBumper(true);
        timer = setTimeout(() => {
          setShowBumper(false);
          setPhase('TRANSITION');
        }, BUMPER_OUT_DURATION);
        break;

      case 'TRANSITION':
        setIsTransitioning(true);
        timer = setTimeout(() => {
          setIsTransitioning(false);
          // Move to next scene
          setCurrentSceneIndex(prev => (prev + 1) % SCENE_SEQUENCE.length);
          setCurrentCommentaryIndex(0);
          setProgressPercent(0);
          setPhase('BUMPER_IN');
        }, TRANSITION_DURATION);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, currentCommentaryIndex, isInitializing]);

  const getCurrentCommentary = useCallback(() => {
    if (!segmentContent || phase !== 'CONTENT_DELIVERY') return '';
    return segmentContent.commentary[currentCommentaryIndex]?.text || '';
  }, [segmentContent, currentCommentaryIndex, phase]);

  const getActivePersonality = useCallback(() => {
    if (!segmentContent || phase !== 'CONTENT_DELIVERY') return 'left';
    return segmentContent.commentary[currentCommentaryIndex]?.personality || 'left';
  }, [segmentContent, currentCommentaryIndex, phase]);

  const getCurrentPriority = useCallback(() => {
    if (!segmentContent || phase !== 'CONTENT_DELIVERY') return 'normal';
    return segmentContent.commentary[currentCommentaryIndex]?.priority || 'normal';
  }, [segmentContent, currentCommentaryIndex, phase]);

  return {
    currentScene,
    phase,
    segmentContent,
    currentCommentary: getCurrentCommentary(),
    activePersonality: getActivePersonality(),
    currentPriority: getCurrentPriority(),
    showBumper,
    isTransitioning,
    progressPercent,
    sceneIndex: currentSceneIndex,
    totalScenes: SCENE_SEQUENCE.length,
    commentaryIndex: currentCommentaryIndex,
    totalCommentary: segmentContent?.commentary.length || 0,
    injectBreakingNews
  };
}
