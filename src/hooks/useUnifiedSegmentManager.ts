import { useState, useEffect, useCallback, useRef } from 'react';
import type { BroadcastScene } from '@/types/broadcast';
import { useSegmentContent, type SegmentContent } from './useSegmentContent';
import { useMultiHackathonEvents, type HackathonEvent } from './useMultiHackathonEvents';

export type SegmentPhase = 'BUMPER_IN' | 'CONTENT_DELIVERY' | 'BUMPER_OUT' | 'TRANSITION' | 'HACKATHON_SWITCH';

export interface UnifiedSegmentState {
  currentScene: BroadcastScene;
  phase: SegmentPhase;
  segmentContent: SegmentContent | null;
  currentCommentaryIndex: number;
  currentCommentary: string;
  activePersonality: 'left' | 'right';
  showBumper: boolean;
  isTransitioning: boolean;
  progressPercent: number;
  currentHackathonId: string | null;
  currentHackathonName: string | null;
  isHackathonSwitching: boolean;
}

const SCENE_SEQUENCE: BroadcastScene[] = ['anchor', 'team', 'market', 'stats', 'highlight'];
const BUMPER_IN_DURATION = 2500; // 2.5s
const BUMPER_OUT_DURATION = 1500; // 1.5s
const TRANSITION_DURATION = 1000; // 1s
const HACKATHON_SWITCH_DURATION = 3000; // 3s for hackathon transitions

// How often to check for hackathon switches (between segments)
const HACKATHON_CHECK_INTERVAL_SCENES = 2; // Check every 2 scenes

export function useUnifiedSegmentManager() {
  const { generateSegment, injectBreakingNews } = useSegmentContent();
  const { hackathons, currentHackathon, latestEvent, getHackathonScores } = useMultiHackathonEvents();

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState<SegmentPhase>('BUMPER_IN');
  const [segmentContent, setSegmentContent] = useState<SegmentContent | null>(null);
  const [currentCommentaryIndex, setCurrentCommentaryIndex] = useState(0);
  const [showBumper, setShowBumper] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHackathonSwitching, setIsHackathonSwitching] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeHackathonId, setActiveHackathonId] = useState<string | null>(null);

  const scenesSinceCheckRef = useRef(0);
  const lastHackathonIdRef = useRef<string | null>(null);

  const currentScene = SCENE_SEQUENCE[currentSceneIndex];

  // Handle breaking news events from any hackathon
  useEffect(() => {
    if (latestEvent && latestEvent.priority === 'breaking') {
      // Convert HackathonEvent to RealtimeBroadcastEvent format
      const breakingNewsEvent = {
        type: latestEvent.type,
        teamName: latestEvent.teamName || latestEvent.hackathonName,
        metricType: latestEvent.metricType,
        currentValue: latestEvent.currentValue,
        change: latestEvent.change,
        priority: latestEvent.priority,
        timestamp: latestEvent.timestamp,
      };

      // If breaking news is from a different hackathon, trigger immediate switch
      if (latestEvent.hackathonId !== activeHackathonId) {
        console.log(`Breaking news from ${latestEvent.hackathonName}! Switching hackathons...`);
        setActiveHackathonId(latestEvent.hackathonId);
        setIsHackathonSwitching(true);
      }

      injectBreakingNews(breakingNewsEvent as any);
    }
  }, [latestEvent, activeHackathonId, injectBreakingNews]);

  // Initialize with first hackathon
  useEffect(() => {
    if (currentHackathon && !activeHackathonId) {
      setActiveHackathonId(currentHackathon.id);
      lastHackathonIdRef.current = currentHackathon.id;
    }
  }, [currentHackathon, activeHackathonId]);

  // Update active hackathon based on multi-hackathon event scores
  useEffect(() => {
    if (!currentHackathon) return;

    // Only check for switches at specific intervals (soft switches)
    if (scenesSinceCheckRef.current >= HACKATHON_CHECK_INTERVAL_SCENES) {
      const scores = getHackathonScores();

      // Find the highest scoring hackathon
      const topHackathon = scores[0];

      // Switch if the top hackathon is different from current and has significant score
      if (topHackathon && topHackathon.score > 20 && topHackathon.hackathonId !== activeHackathonId) {
        console.log(`Switching to ${topHackathon.hackathonName} (score: ${topHackathon.score.toFixed(1)})`);
        setActiveHackathonId(topHackathon.hackathonId);
        setIsHackathonSwitching(true);
        scenesSinceCheckRef.current = 0;
      }
    }
  }, [currentSceneIndex, currentHackathon, activeHackathonId, getHackathonScores]);

  // Initialize segment content when scene changes or hackathon changes
  useEffect(() => {
    if (!activeHackathonId) return;

    setIsInitializing(true);

    // Generate segment asynchronously
    const loadSegment = async () => {
      const content = await generateSegment(currentScene);

      // Add hackathon context to segment
      const activeHackathon = hackathons.find(h => h.id === activeHackathonId);
      if (activeHackathon) {
        content.subtitle = `${activeHackathon.name} • ${content.subtitle}`;
      }

      setSegmentContent(content);
      setCurrentCommentaryIndex(0);
      setProgressPercent(0);

      // Allow state machine to run on next tick
      setTimeout(() => setIsInitializing(false), 0);
    };

    loadSegment();
  }, [currentScene, activeHackathonId, generateSegment, hackathons]);

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

          // Check if we need to switch hackathons
          if (isHackathonSwitching) {
            setPhase('HACKATHON_SWITCH');
          } else {
            setPhase('TRANSITION');
          }
        }, BUMPER_OUT_DURATION);
        break;

      case 'HACKATHON_SWITCH':
        setIsHackathonSwitching(true);
        timer = setTimeout(() => {
          setIsHackathonSwitching(false);
          lastHackathonIdRef.current = activeHackathonId;

          // Move to next scene after hackathon switch
          setCurrentSceneIndex(prev => (prev + 1) % SCENE_SEQUENCE.length);
          setCurrentCommentaryIndex(0);
          setProgressPercent(0);
          scenesSinceCheckRef.current = 0;
          setPhase('BUMPER_IN');
        }, HACKATHON_SWITCH_DURATION);
        break;

      case 'TRANSITION':
        setIsTransitioning(true);
        timer = setTimeout(() => {
          setIsTransitioning(false);

          // Move to next scene
          setCurrentSceneIndex(prev => (prev + 1) % SCENE_SEQUENCE.length);
          setCurrentCommentaryIndex(0);
          setProgressPercent(0);
          scenesSinceCheckRef.current += 1;
          setPhase('BUMPER_IN');
        }, TRANSITION_DURATION);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, currentCommentaryIndex, isInitializing, segmentContent, isHackathonSwitching, activeHackathonId]);

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

  const getActiveHackathon = useCallback(() => {
    return hackathons.find(h => h.id === activeHackathonId) || null;
  }, [hackathons, activeHackathonId]);

  return {
    currentScene,
    phase,
    segmentContent,
    currentCommentary: getCurrentCommentary(),
    activePersonality: getActivePersonality(),
    currentPriority: getCurrentPriority(),
    showBumper,
    isTransitioning,
    isHackathonSwitching,
    progressPercent,
    sceneIndex: currentSceneIndex,
    totalScenes: SCENE_SEQUENCE.length,
    commentaryIndex: currentCommentaryIndex,
    totalCommentary: segmentContent?.commentary.length || 0,
    currentHackathonId: activeHackathonId,
    currentHackathonName: getActiveHackathon()?.name || null,
    activeHackathon: getActiveHackathon(),
    allHackathons: hackathons,
    hackathonScores: getHackathonScores(),
    injectBreakingNews
  };
}
