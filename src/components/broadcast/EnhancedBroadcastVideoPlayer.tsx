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
import { Watermark } from './graphics/Watermark';
import { CameraEffects, useAutoCameraMovement } from './effects/CameraEffects';
import { EventAnimations } from './effects/EventAnimations';
import { ProductionEffects } from './effects/ProductionEffects';
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
  const [showEventAnimation, setShowEventAnimation] = useState(false);
  const [eventType, setEventType] = useState<'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close'>('big-bet');
  
  // Auto camera movement
  const cameraMovement = useAutoCameraMovement(20000);

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
        <ProductionEffects filmGrain vignette colorGrade="warm">
          <CameraEffects movement={cameraMovement} intensity={0.5}>
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

        {/* Watermark */}
        <Watermark showLiveIndicator={isLive} />

        {/* Event Animations */}
        <EventAnimations
          isActive={showEventAnimation}
          eventType={eventType}
          data={{ teamName: 'Team Alpha', amount: 5000 }}
          onComplete={() => setShowEventAnimation(false)}
        />

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
          </CameraEffects>
        </ProductionEffects>
      </div>

      {/* Test Panel for Development */}
      <BroadcastTestPanel />
      
      {/* Debug: Trigger event animation button */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setEventType('big-bet');
            setShowEventAnimation(true);
          }}
          className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-bold hover:bg-yellow-600"
        >
          Trigger Big Bet
        </button>
        <button
          onClick={() => {
            setEventType('team-milestone');
            setShowEventAnimation(true);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600"
        >
          Trigger Milestone
        </button>
        <button
          onClick={() => {
            setEventType('odds-surge');
            setShowEventAnimation(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
        >
          Trigger Odds Surge
        </button>
      </div>
    </div>
  );
}
