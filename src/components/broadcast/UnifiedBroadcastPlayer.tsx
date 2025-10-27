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
import { BroadcastPausedOverlay } from './BroadcastPausedOverlay';
import { useUnifiedSegmentManager } from '@/hooks/useUnifiedSegmentManager';
import { useGlobalBroadcastState } from '@/hooks/useGlobalBroadcastState';
import { useViewerPresence } from '@/hooks/useViewerPresence';
import { selectPersonalityForScene } from '@/types/broadcastPersonality';
import type { BroadcastScene } from '@/types/broadcast';
import { useToast } from '@/hooks/use-toast';
import { Radio, Play, Pause, Users } from 'lucide-react';
import { useAutoPauseOnNoViewers } from '@/hooks/useAutoPauseOnNoViewers';

export function UnifiedBroadcastPlayer() {
  const { toast } = useToast();

  // Global broadcast state (synchronized across all users)
  const broadcastStateData = useGlobalBroadcastState();
  const {
    state: broadcastState,
    currentScene: globalScene,
    isLoading: stateLoading,
    isPaused,
    pausedAt,
    isPausedBySystem,
    autoPauseEnabled,
    liveViewerCount,
    isMasterUser,
    togglePause,
    systemPause,
    systemResume,
    toggleAutoPause,
  } = broadcastStateData;

  // Unified segment manager for multi-hackathon broadcasts
  const {
    currentScene,
    phase,
    segmentContent,
    currentCommentary,
    activePersonality,
    currentPriority,
    showBumper,
    isTransitioning,
    isHackathonSwitching,
    progressPercent,
    commentaryIndex,
    totalCommentary,
    currentHackathonId,
    currentHackathonName,
    activeHackathon,
    allHackathons,
    hackathonScores,
    injectBreakingNews
  } = useUnifiedSegmentManager(isPaused, stateLoading);

  // Track viewer presence
  const { viewerCount } = useViewerPresence();

  // Event animation states
  const [showEventAnimation, setShowEventAnimation] = useState(false);
  const [eventType, setEventType] = useState<'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close'>('big-bet');
  const [showChyron, setShowChyron] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [previousHackathonName, setPreviousHackathonName] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-pause when no viewers
  useAutoPauseOnNoViewers({
    viewerCount: viewerCount,
    isPaused,
    isPausedBySystem,
    autoPauseEnabled,
    isMasterUser,
    onSystemPause: systemPause,
    onSystemResume: systemResume,
  });

  // Track hackathon changes for smooth transitions
  useEffect(() => {
    if (currentHackathonName && currentHackathonName !== previousHackathonName && previousHackathonName !== null) {
      toast({
        title: "🔄 Switching Coverage",
        description: `Now covering: ${currentHackathonName}`,
        duration: 4000,
      });
    }
    setPreviousHackathonName(currentHackathonName);
  }, [currentHackathonName, previousHackathonName, toast]);

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

  // Get personality for current segment
  const personalities = selectPersonalityForScene(currentScene);
  const activePersonalityData = personalities.find(p =>
    p.position === (activePersonality === 'left' ? 'left' : 'right')
  ) || personalities[0];

  const isLive = broadcastState === 'live';

  const togglePlayPause = () => {
    // In global mode, users cannot control play/pause
    // No-op: Broadcast state is controlled globally
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

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    console.log('Mute toggled:', !isMuted);
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

  // Keyboard shortcuts (including master user pause control)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Master user can pause/unpause with 'P' key
      if (e.code === 'KeyP' && isMasterUser) {
        e.preventDefault();
        togglePause();
        toast({
          title: isPaused ? "🎬 Broadcast Resumed" : "⏸️ Broadcast Paused",
          description: isPaused ? "Broadcast is now playing for all viewers" : "Broadcast is now paused for all viewers",
          duration: 3000,
        });
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [broadcastState, isMasterUser, isPaused, togglePause, toast]);

  if (stateLoading) {
    return (
      <div className="w-full aspect-video bg-card rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Loading unified broadcast...</p>
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
        {/* Splash screen and commercial break */}
        {broadcastState === 'splash' && (
          <BroadcastSplashScreen onComplete={() => {}} />
        )}

        {broadcastState === 'commercial' && (
          <CommercialBreak duration={30} onComplete={() => {}} />
        )}

        {/* Broadcast Paused Overlay (highest priority - shows above everything) */}
        <AnimatePresence>
          {isPaused && (
            <BroadcastPausedOverlay pausedAt={pausedAt} isPausedBySystem={isPausedBySystem} />
          )}
        </AnimatePresence>

        {/* Hackathon switching animation */}
        <AnimatePresence>
          {isHackathonSwitching && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[200] bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 backdrop-blur-lg flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -20 }}
                className="text-center space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto"
                >
                  <Radio className="w-full h-full text-neon-yellow" />
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-neon-yellow via-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Switching Coverage
                </h2>
                <p className="text-xl text-white/90">
                  Now covering: <span className="font-bold text-neon-yellow">{currentHackathonName}</span>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  isMuted={isMuted}
                  isPaused={isPaused}
                  personalityId={activePersonalityData.id}
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

            {/* Layer 5: Bottom ticker tape */}
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

            {/* Top UI Bar with Hackathon Indicator */}
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
              <ClockAndDate />
              <div className="flex items-center gap-4">
                {/* Current Hackathon Indicator */}
                {currentHackathonName && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 backdrop-blur-md border border-neon-purple/30 rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4 text-neon-yellow animate-pulse" />
                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Now Covering</div>
                      <div className="font-bold text-white">{currentHackathonName}</div>
                    </div>
                  </motion.div>
                )}
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
            {isTransitioning && !isHackathonSwitching && (
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

            {/* Multi-Hackathon Score Display (Dev Mode) */}
            {import.meta.env.DEV && hackathonScores.length > 0 && (
              <div className="absolute top-24 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/20 z-50 max-w-xs">
                <div className="text-xs font-bold mb-2 text-primary">Hackathon Scores</div>
                <div className="space-y-1">
                  {hackathonScores.slice(0, 3).map((score, idx) => (
                    <div key={score.hackathonId} className="flex justify-between items-center text-xs">
                      <span className={score.hackathonId === currentHackathonId ? 'text-neon-yellow font-bold' : 'text-muted-foreground'}>
                        {idx + 1}. {score.hackathonName.slice(0, 20)}
                      </span>
                      <span className="font-mono text-primary">{score.score.toFixed(1)}</span>
                    </div>
                  ))}
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
            isMuted={isMuted}
            isPaused={isPaused}
            isMasterUser={isMasterUser}
            onPlayPause={togglePlayPause}
            onFullscreen={handleFullscreen}
            onToggleMute={handleToggleMute}
            onTogglePause={togglePause}
          />
        </div>

        {/* Master User Controls (hidden from non-master users) */}
        {isMasterUser && (
          <div className="absolute top-20 left-4 z-[250] space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
                toast({
                  title: isPaused ? "🎬 Broadcast Resumed" : "⏸️ Broadcast Paused",
                  description: isPaused ? "Broadcast is now playing for all viewers" : "Broadcast is now paused for all viewers",
                  duration: 3000,
                });
              }}
              className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isPaused ? 'Resume' : 'Pause'} Broadcast
              </span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAutoPause();
                toast({
                  title: autoPauseEnabled ? "⏸️ Auto-Pause Disabled" : "▶️ Auto-Pause Enabled",
                  description: autoPauseEnabled 
                    ? "Broadcast will NOT pause when no viewers" 
                    : "Broadcast will auto-pause after 30s with no viewers",
                  duration: 3000,
                });
              }}
              className="flex items-center gap-2 bg-card/90 hover:bg-card border border-border text-foreground px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">
                Auto-Pause: {autoPauseEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            
            <div className="bg-card/90 border border-border px-4 py-2 rounded-lg shadow-lg text-xs space-y-1">
              <div className="text-muted-foreground">Viewer Count</div>
              <div className="font-bold text-lg">{viewerCount}</div>
              {isPausedBySystem && (
                <div className="text-yellow-500 text-xs">System Paused</div>
              )}
            </div>
            
            <p className="text-xs text-white/60 ml-1">
              Master Control • Press 'P' to toggle
            </p>
          </div>
        )}

        {/* Dev tools */}
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

      {/* Test Panel for Development */}
      {import.meta.env.DEV && <BroadcastTestPanel />}
    </div>
  );
}
