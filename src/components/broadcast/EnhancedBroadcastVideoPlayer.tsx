import { useState, useEffect } from 'react';
import { BroadcastCharacter } from './BroadcastCharacter';
import { BroadcastHeader } from './BroadcastHeader';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { LiveViewersCounter } from './LiveViewersCounter';
import { NewsStudioBackground } from './NewsStudioBackground';
import { NewsDeskOverlay } from './NewsDeskOverlay';
import { BreakingNewsBanner } from './BreakingNewsBanner';
import { LiveScoreBoard } from './LiveScoreBoard';
import { ClockAndDate } from './ClockAndDate';
import { BroadcastTestPanel } from './BroadcastTestPanel';
import { BroadcastSplashScreen } from './BroadcastSplashScreen';
import { SegmentTransition } from './SegmentTransition';
import { CommercialBreak } from './CommercialBreak';
import { ChyronLower } from './graphics/ChyronLower';
import { InfoBar } from './graphics/InfoBar';
import { SegmentBumper } from './graphics/SegmentBumper';
import { useSceneRotation } from '@/hooks/useSceneRotation';
import { useAIBroadcastContent } from '@/hooks/useAIBroadcastContent';
import { useBroadcastDialogue } from '@/hooks/useBroadcastDialogue';
import { useBroadcastState } from '@/hooks/useBroadcastState';
import { selectPersonalityForScene } from '@/types/broadcastPersonality';
import type { BroadcastScene } from '@/types/broadcast';

export function EnhancedBroadcastVideoPlayer() {
  const { currentScene, sceneIndex } = useSceneRotation(30000);
  const { commentary, tickerItems, bannerText, isLive } = useAIBroadcastContent();
  const {
    broadcastState,
    isTransitioning,
    fromScene,
    toScene,
    goLive,
    startCommercialBreak,
    endCommercialBreak,
    startTransition,
    endTransition,
  } = useBroadcastState();

  const [previousScene, setPreviousScene] = useState<BroadcastScene>(currentScene);
  const [showBumper, setShowBumper] = useState(false);

  // Convert commentary to dialogue with turn-taking
  const narratives = commentary 
    ? [{ id: commentary.id || '1', text: commentary.text || '', timestamp: commentary.created_at || new Date().toISOString() }]
    : [];
  
  const { currentDialogue } = useBroadcastDialogue(narratives);
  
  // Use real-time commentary or default welcome message
  const currentNarrative = currentDialogue?.text || (
    commentary?.text || 
    "Good evening, and welcome to HackCast Live. We're bringing you real-time coverage from the hackathon floor where teams are competing for glory."
  );
  const activeAnchor = currentDialogue?.anchor || 'left';

  // Get personalities for current scene
  const personalities = selectPersonalityForScene(currentScene);
  const currentPersonality = personalities[0]; // For now, use first personality

  // Handle scene transitions
  useEffect(() => {
    if (broadcastState !== 'live') return;

    if (currentScene !== previousScene) {
      // Show bumper first
      setShowBumper(true);
      
      // After bumper, start transition
      const bumperTimer = setTimeout(() => {
        setShowBumper(false);
        startTransition(previousScene, currentScene);
      }, 2500);

      // After transition, update scene
      const transitionTimer = setTimeout(() => {
        endTransition();
        setPreviousScene(currentScene);
      }, 3500);

      return () => {
        clearTimeout(bumperTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [currentScene, previousScene, broadcastState, startTransition, endTransition]);

  // Commercial break every 5 scenes (approx 2.5 minutes)
  useEffect(() => {
    if (broadcastState === 'live' && sceneIndex > 0 && sceneIndex % 5 === 0) {
      startCommercialBreak();
    }
  }, [sceneIndex, broadcastState, startCommercialBreak]);

  // Show splash screen
  if (broadcastState === 'splash') {
    return <BroadcastSplashScreen onComplete={goLive} />;
  }

  // Show commercial break
  if (broadcastState === 'commercial') {
    return <CommercialBreak duration={30} onComplete={endCommercialBreak} />;
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-gradient-to-br from-broadcast-blue to-broadcast-blue-dark border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Layer 0: Professional News Studio Background */}
        <div className="absolute inset-0 z-0">
          <NewsStudioBackground scene={currentScene} />
        </div>
        
        {/* Layer 1: News Anchors positioned at desk level */}
        <div className="absolute inset-0 z-10">
          <BroadcastCharacter 
            narrative={currentNarrative}
            isLive={isLive}
            isSpeaking={!!commentary}
            activeAnchor={activeAnchor}
          />
        </div>

        {/* Layer 2: News Desk Overlay (foreground - in front of anchors) */}
        <div className="absolute inset-0 z-20">
          <NewsDeskOverlay />
        </div>

        {/* Layer 3: Info Bar at top */}
        <InfoBar />

        {/* Layer 4: Breaking News Banner (if priority is high) */}
        {bannerText && bannerText.priority === 'breaking' && (
          <div className="absolute inset-0 z-50">
            <BreakingNewsBanner
              teamName={bannerText.team_name || 'Breaking News'}
              text={bannerText.text}
            />
          </div>
        )}

        {/* Layer 5: Lower third banner (normal priority) */}
        {bannerText && bannerText.priority !== 'breaking' && (
          <div className="absolute inset-0 z-30">
            <LowerThirdBanner
              teamName={bannerText.team_name || 'Update'}
              metric={bannerText.text}
              value={0}
              change={0}
            />
          </div>
        )}

        {/* Layer 6: Chyron for current personality */}
        {currentPersonality && (
          <ChyronLower
            name={currentPersonality.name}
            title={currentPersonality.title}
            position={activeAnchor as 'left' | 'right' | 'center'}
            accentColor={currentPersonality.primaryColor}
          />
        )}

        {/* Layer 7: Bottom ticker tape */}
        <div className="absolute inset-0 z-30">
          <TickerTape items={tickerItems} />
        </div>

        {/* Layer 8: Header & UI Elements */}
        <div className="absolute top-0 left-0 right-0 z-40">
          <BroadcastHeader currentScene={currentScene} isLive={isLive} />
        </div>
        
        {/* Clock and Date */}
        <div className="absolute top-0 left-0 z-40">
          <ClockAndDate />
        </div>
        
        {/* Live Scoreboard */}
        <div className="absolute top-0 right-0 z-40">
          <LiveScoreBoard />
        </div>
        
        {/* Live Viewers Counter */}
        <div className="absolute bottom-10 right-4 z-40">
          <LiveViewersCounter />
        </div>

        {/* Segment Bumper */}
        {showBumper && (
          <SegmentBumper 
            scene={currentScene} 
            onComplete={() => setShowBumper(false)} 
          />
        )}

        {/* Segment Transition */}
        {isTransitioning && (
          <SegmentTransition
            isActive={isTransitioning}
            fromScene={fromScene}
            toScene={toScene}
            onComplete={endTransition}
          />
        )}
      </div>

      {/* Test Panel for Development */}
      <BroadcastTestPanel />
    </div>
  );
}
