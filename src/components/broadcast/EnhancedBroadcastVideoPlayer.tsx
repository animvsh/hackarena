import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useSegmentManager } from '@/hooks/useSegmentManager';
import { useBroadcastState } from '@/hooks/useBroadcastState';
import { useRealtimeBroadcastEvents } from '@/hooks/useRealtimeBroadcastEvents';
import { selectPersonalityForScene } from '@/types/broadcastPersonality';
import type { BroadcastScene } from '@/types/broadcast';
import { useToast } from '@/hooks/use-toast';

export function EnhancedBroadcastVideoPlayer() {
  const { toast } = useToast();
  
  // Segment-driven content management
  const {
    currentScene,
    phase,
    segmentContent,
    currentCommentary,
    activePersonality,
    currentPriority,
    showBumper,
    isTransitioning,
    progressPercent,
    commentaryIndex,
    totalCommentary,
    injectBreakingNews
  } = useSegmentManager();
  
  const {
    broadcastState,
    goLive,
    startCommercialBreak,
    endCommercialBreak,
  } = useBroadcastState();
  
  // Event animation states
  const [showEventAnimation, setShowEventAnimation] = useState(false);
  const [eventType, setEventType] = useState<'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close'>('big-bet');
  const [showChyron, setShowChyron] = useState(false);
  
  // Auto camera movement
  const cameraMovement = useAutoCameraMovement(20000);

  // Real-time event integration
  useRealtimeBroadcastEvents((event) => {
    console.log('📡 Broadcast event received:', event);
    
    // Show toast for breaking news
    if (event.priority === 'breaking') {
      toast({
        title: "🔴 BREAKING NEWS",
        description: `${event.teamName}: ${event.metricType} - ${event.currentValue}`,
        duration: 5000,
      });
    }

    // Inject into segment flow
    injectBreakingNews(event);
  });

  // Show chyron at start of each segment
  useEffect(() => {
    if (phase === 'CONTENT_DELIVERY' && commentaryIndex === 0) {
      setShowChyron(true);
      const timer = setTimeout(() => setShowChyron(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [phase, commentaryIndex]);

  // Trigger event animations on breaking news
  useEffect(() => {
    if (currentPriority === 'breaking' && phase === 'CONTENT_DELIVERY') {
      const eventTypes: Array<'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close'> = 
        ['big-bet', 'team-milestone', 'odds-surge'];
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      setEventType(randomEvent);
      setShowEventAnimation(true);
      const timer = setTimeout(() => setShowEventAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentCommentary, currentPriority, phase]);

  // Commercial breaks every 5 complete segments (after highlight)
  useEffect(() => {
    if (broadcastState !== 'live') return;
    if (phase !== 'BUMPER_OUT') return;
    
    // Trigger commercial after highlight segment
    if (currentScene === 'highlight') {
      const commercialTimer = setTimeout(() => {
        startCommercialBreak();
      }, 1000);
      return () => clearTimeout(commercialTimer);
    }
  }, [broadcastState, phase, currentScene, startCommercialBreak]);

  // Get personality for current segment
  const personalities = selectPersonalityForScene(currentScene);
  const activePersonalityData = personalities.find(p => 
    p.position === (activePersonality === 'left' ? 'left' : 'right')
  ) || personalities[0];

  // Show splash screen
  if (broadcastState === 'splash') {
    return <BroadcastSplashScreen onComplete={goLive} />;
  }

  // Show commercial break
  if (broadcastState === 'commercial') {
    return <CommercialBreak duration={30} onComplete={endCommercialBreak} />;
  }

  const isLive = broadcastState === 'live';

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
              {currentCommentary && phase === 'CONTENT_DELIVERY' && (
                <BroadcastCharacter 
                  narrative={currentCommentary} 
                  isLive={isLive}
                  isSpeaking={phase === 'CONTENT_DELIVERY'}
                  activeAnchor={activePersonality}
                />
              )}
            </div>

            {/* Layer 2: News Desk Overlay (foreground - in front of anchors) */}
            <div className="absolute inset-0 z-20">
              <NewsDeskOverlay />
            </div>

            {/* Layer 3: Info Bar at top */}
            <InfoBar />

            {/* Layer 4: Breaking News Banner (if priority is breaking) */}
            {currentPriority === 'breaking' && phase === 'CONTENT_DELIVERY' && (
              <div className="absolute inset-0 z-50">
                <BreakingNewsBanner
                  teamName={segmentContent?.title || 'Breaking News'}
                  text={currentCommentary}
                />
              </div>
            )}

            {/* Layer 5: Lower third banner with segment-specific text */}
            {segmentContent?.bannerText && phase === 'CONTENT_DELIVERY' && !showBumper && currentPriority !== 'breaking' && (
              <div className="absolute inset-0 z-30">
                <LowerThirdBanner
                  teamName={segmentContent.title}
                  metric={segmentContent.bannerText}
                  value={0}
                  change={0}
                />
              </div>
            )}

            {/* Layer 6: Chyron for personality intro - shown at segment start */}
            {showChyron && activePersonalityData && (
              <ChyronLower
                name={activePersonalityData.name}
                title={activePersonalityData.title}
                position={activePersonality}
                accentColor={activePersonalityData.primaryColor}
              />
            )}

            {/* Layer 7: Bottom ticker tape with segment-specific content */}
            <div className="absolute inset-0 z-30">
              <TickerTape items={segmentContent?.tickerItems.map((item, idx) => ({
                id: `ticker-${idx}`,
                text: item.text,
                team_name: segmentContent.title,
                priority: currentPriority,
                content_type: 'ticker' as const,
                duration: 5,
                created_at: new Date().toISOString()
              })) || []} />
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
            <AnimatePresence>
              {showBumper && segmentContent && (
                <SegmentBumper 
                  scene={currentScene} 
                  onComplete={() => {}}
                />
              )}
            </AnimatePresence>

            {/* Segment Transition */}
            {isTransitioning && (
              <SegmentTransition
                isActive={isTransitioning}
                fromScene={currentScene}
                toScene={currentScene}
                onComplete={() => {}}
              />
            )}

            {/* Segment progress indicator */}
            {phase === 'CONTENT_DELIVERY' && (
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/20 z-50">
                <div className="text-xs text-muted-foreground mb-1">
                  {segmentContent?.title} • {commentaryIndex + 1}/{totalCommentary}
                </div>
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-primary mt-1 font-mono">
                  Phase: {phase}
                </div>
              </div>
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
