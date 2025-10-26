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
import { SegmentBumper } from './graphics/SegmentBumper';
import { Watermark } from './graphics/Watermark';
import { CameraEffects } from './effects/CameraEffects';
import { EventAnimations } from './effects/EventAnimations';
import { ProductionEffects } from './effects/ProductionEffects';
import { VideoPlayerControls } from './VideoPlayerControls';
import { useSegmentManager } from '@/hooks/useSegmentManager';
import { useGlobalBroadcastState } from '@/hooks/useGlobalBroadcastState';
import { useViewerPresence } from '@/hooks/useViewerPresence';
import { useRealtimeBroadcastEvents } from '@/hooks/useRealtimeBroadcastEvents';
import { selectPersonalityForScene } from '@/types/broadcastPersonality';
import type { BroadcastScene } from '@/types/broadcast';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBroadcastVideoPlayerProps {
  hackathonId?: string;
}

export function EnhancedBroadcastVideoPlayer({ hackathonId }: EnhancedBroadcastVideoPlayerProps = {}) {
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
  
  // Global broadcast state (synchronized across all users)
  const {
    state: broadcastState,
    currentScene: globalScene,
    isLoading: stateLoading,
  } = useGlobalBroadcastState();
  
  // Track viewer presence
  useViewerPresence();
  
  // Event animation states
  const [showEventAnimation, setShowEventAnimation] = useState(false);
  const [eventType, setEventType] = useState<'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close'>('big-bet');
  const [showChyron, setShowChyron] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Commercial breaks are now controlled globally
  // This effect is disabled in global mode

  // Get personality for current segment
  const personalities = selectPersonalityForScene(currentScene);
  const activePersonalityData = personalities.find(p => 
    p.position === (activePersonality === 'left' ? 'left' : 'right')
  ) || personalities[0];

  const isLive = broadcastState === 'live';

  // Note: Play/pause is controlled globally now
  const togglePlayPause = () => {
    // In global mode, users cannot control play/pause
    console.log('Broadcast state is controlled globally');
  };

  const handleFullscreen = () => {
    const elem = document.querySelector('.video-player-container');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isLive) setControlsVisible(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (isLive) {
      setControlsVisible(false);
    }
  };

  const handleClick = () => {
    togglePlayPause();
  };

  // Keyboard shortcuts - MUST be before early returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't prevent spacebar if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [broadcastState]);

  if (stateLoading) {
    return (
      <div className="w-full aspect-video bg-card rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Loading broadcast...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className="video-player-container relative aspect-video bg-gradient-to-br from-broadcast-blue to-broadcast-blue-dark border border-border rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Splash screen and commercial break are now INSIDE the video container */}
        {broadcastState === 'splash' && (
          <BroadcastSplashScreen onComplete={() => console.log('Splash complete - controlled globally')} />
        )}
        
        {broadcastState === 'commercial' && (
          <CommercialBreak duration={30} onComplete={() => console.log('Commercial complete - controlled globally')} />
        )}

        {/* Main broadcast content - only show when live */}
        {broadcastState === 'live' && (
        <ProductionEffects filmGrain vignette colorGrade="warm">
          <CameraEffects movement="static" intensity={0}>
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

            {/* Layer 3: Breaking News Banner (if priority is breaking) */}
            {currentPriority === 'breaking' && phase === 'CONTENT_DELIVERY' && (
              <div className="absolute inset-0 z-50">
                <BreakingNewsBanner
                  teamName={segmentContent?.title || 'Breaking News'}
                  text={currentCommentary}
                />
              </div>
            )}

            {/* Layer 4: Lower third banner - only show when no breaking news */}
            {segmentContent?.bannerText && phase === 'CONTENT_DELIVERY' && !showBumper && currentPriority !== 'breaking' && (
              <div className="absolute bottom-16 left-0 right-0 z-30">
                <LowerThirdBanner
                  teamName={segmentContent.title}
                  metric={segmentContent.bannerText}
                  value={0}
                  change={0}
                />
              </div>
            )}

            {/* Layer 5: Bottom ticker tape - simplified, less prominent */}
            <div className="absolute bottom-0 left-0 right-0 z-25">
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

            {/* Top UI Bar - simplified */}
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
              <ClockAndDate />
              <div className="flex items-center gap-4">
                <LiveViewersCounter />
              </div>
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
        )}

        {/* Click overlay for play/pause */}
        <div 
          className="absolute inset-0 z-[105]"
          onClick={handleClick}
        />

        {/* Bottom gradient for controls */}
        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-[100] transition-opacity duration-300 ${
          controlsVisible || !isLive ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Video player controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-[110] transition-opacity duration-300 ${
          controlsVisible || !isLive ? 'opacity-100' : 'opacity-0'
        }`}>
          <VideoPlayerControls
            isPlaying={isLive}
            isLive={isLive}
            progress={progressPercent}
            onPlayPause={togglePlayPause}
            onFullscreen={handleFullscreen}
          />
        </div>

        {/* Dev tools - inside video container */}
        {import.meta.env.DEV && (
          <div className="absolute bottom-20 left-4 z-[115] opacity-50 hover:opacity-100 transition-opacity">
            <div className="flex gap-2 flex-wrap max-w-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventType('big-bet');
                  setShowEventAnimation(true);
                }}
                className="px-3 py-1.5 bg-yellow-500/90 text-black rounded-lg text-xs font-bold hover:bg-yellow-600 backdrop-blur-sm"
              >
                Big Bet
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventType('team-milestone');
                  setShowEventAnimation(true);
                }}
                className="px-3 py-1.5 bg-purple-500/90 text-white rounded-lg text-xs font-bold hover:bg-purple-600 backdrop-blur-sm"
              >
                Milestone
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventType('odds-surge');
                  setShowEventAnimation(true);
                }}
                className="px-3 py-1.5 bg-green-500/90 text-white rounded-lg text-xs font-bold hover:bg-green-600 backdrop-blur-sm"
              >
                Odds Surge
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test Panel for Development - outside video but properly styled */}
      {import.meta.env.DEV && <BroadcastTestPanel />}
    </div>
  );
}
