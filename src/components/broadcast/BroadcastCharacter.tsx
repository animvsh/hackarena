import { useState, useEffect, useRef, useCallback } from 'react';
import anchorLeftImg from '@/assets/news-anchor-left.png';
import anchorRightImg from '@/assets/news-anchor-right.png';
import { MouthAnimation } from './MouthAnimation';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

interface BroadcastCharacterProps {
  narrative: string;
  isLive: boolean;
  isSpeaking?: boolean;
  activeAnchor?: 'left' | 'right';
  isMuted?: boolean;
  isPaused?: boolean;
  personalityId?: string;
}

type CharacterState = 'idle' | 'speaking' | 'excited';

export function BroadcastCharacter({ narrative, isLive, isSpeaking = false, activeAnchor = 'left', isMuted = false, isPaused = false, personalityId }: BroadcastCharacterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [leftBlinking, setLeftBlinking] = useState(false);
  const [rightBlinking, setRightBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [shoulderMove, setShoulderMove] = useState(0);
  
  // Store all timer IDs for cleanup
  const timersRef = useRef<{
    typeInterval?: NodeJS.Timeout;
    leftBlink?: NodeJS.Timeout;
    rightBlink?: NodeJS.Timeout;
    movement?: NodeJS.Timeout;
    mouth?: NodeJS.Timeout;
  }>({});

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    console.log('[BroadcastCharacter] Clearing all animation timers');
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearInterval(timer);
    });
    timersRef.current = {};
  }, []);

  // Voice IDs for each anchor - use personality-specific voice if provided
  const voiceId = personalityId 
    ? (personalityId === 'sarah' ? 'EXAVITQu4vr4xnSDxMaL' 
       : personalityId === 'marcus' ? '21m00Tcm4TlvDq8ikWAM'
       : personalityId === 'aisha' ? 'pNInz6obpgDQGcFmaJgB'
       : personalityId === 'jake' ? 'TX3LPaxmHKxFdv7VOQHJ'
       : personalityId === 'lisa' ? 'pFZP5JQG7iQjIQuC4Bku'
       : personalityId === 'chen-wei' ? 'onwK4e9ZLuTAKqWW03F9'
       : activeAnchor === 'left' ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM')
    : (activeAnchor === 'left' 
        ? 'EXAVITQu4vr4xnSDxMaL' // Sarah - Professional Female Voice
        : '21m00Tcm4TlvDq8ikWAM'); // Marcus - Professional Male Voice

  // ElevenLabs TTS integration
  const { isLoading: ttsLoading, error: ttsError } = useElevenLabsTTS({
    text: narrative,
    voiceId,
    isMuted,
    isPaused,
    enabled: isLive && isSpeaking,
  });

  // Debug logging for TTS state
  useEffect(() => {
    if (narrative) {
      console.log('[BroadcastCharacter TTS]', {
        narrative: narrative.substring(0, 50) + '...',
        voiceId,
        isMuted,
        isPaused,
        enabled: isLive && isSpeaking,
        activeAnchor,
        personalityId
      });
    }
  }, [narrative, voiceId, isMuted, isPaused, isLive, isSpeaking, activeAnchor, personalityId]);

  // Log TTS errors in console for debugging
  useEffect(() => {
    if (ttsError) {
      console.warn('TTS Error:', ttsError);
    }
  }, [ttsError]);

  // Smooth text reveal effect - updates when narrative changes
  useEffect(() => {
    if (!narrative || isPaused) {
      if (isPaused) {
        console.log('[BroadcastCharacter] Pausing typing animation');
      }
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    setCharacterState('speaking');
    
    let currentIndex = 0;
    const typingSpeed = 15;

    const typeInterval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 2));
        setMouthOpen(prev => !prev);
        currentIndex += 2;
      } else {
        setIsTyping(false);
        setMouthOpen(false);
        setTimeout(() => {
          if (!isSpeaking) {
            setCharacterState('idle');
          }
        }, 1000);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    timersRef.current.typeInterval = typeInterval;
    return () => clearInterval(typeInterval);
  }, [narrative, isSpeaking, isPaused]);

  // Random blinking for realism
  useEffect(() => {
    const blinkLeft = () => {
      setLeftBlinking(true);
      setTimeout(() => setLeftBlinking(false), 150);
    };
    
    const blinkRight = () => {
      setRightBlinking(true);
      setTimeout(() => setRightBlinking(false), 150);
    };

    const leftInterval = setInterval(blinkLeft, Math.random() * 3000 + 2000);
    const rightInterval = setInterval(blinkRight, Math.random() * 3000 + 2500);

    return () => {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    };
  }, []);

  // Subtle head movements and gestures - pause when broadcast is paused
  useEffect(() => {
    if (isPaused) {
      console.log('[BroadcastCharacter] Pausing head movement');
      if (timersRef.current.movement) clearInterval(timersRef.current.movement);
      return;
    }

    const movementInterval = setInterval(() => {
      setHeadTilt(Math.random() * 4 - 2);
      setShoulderMove(Math.random() * 2 - 1);
    }, 4000);

    timersRef.current.movement = movementInterval;
    return () => clearInterval(movementInterval);
  }, [isPaused]);

  // Continuous mouth animation during speaking - pause when broadcast is paused
  useEffect(() => {
    if (!isSpeaking || characterState !== 'speaking' || isPaused) {
      setMouthOpen(false);
      if (isPaused && timersRef.current.mouth) {
        console.log('[BroadcastCharacter] Pausing mouth animation');
        clearInterval(timersRef.current.mouth);
      }
      return;
    }

    const mouthInterval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 250);

    timersRef.current.mouth = mouthInterval;
    return () => clearInterval(mouthInterval);
  }, [isSpeaking, characterState, isPaused]);

  useEffect(() => {
    if (isSpeaking) {
      setCharacterState('speaking');
    } else if (!isTyping) {
      setCharacterState('idle');
    }
  }, [isSpeaking, isTyping]);

  const getCharacterColor = () => {
    switch (characterState) {
      case 'speaking':
        return 'from-primary to-primary-glow';
      case 'excited':
        return 'from-destructive to-accent';
      default:
        return 'from-muted to-muted-foreground';
    }
  };

  const anchorName = activeAnchor === 'left' ? 'Sarah Chen' : 'Marcus Reid';
  const anchorTitle = activeAnchor === 'left' ? 'Lead Analyst' : 'Senior Reporter';

  return (
    <div className="absolute inset-0 z-10">
      {/* News Anchors Container */}
      <div className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 flex items-end gap-8 lg:gap-16">
        {/* Left Anchor */}
        <div 
          className={`relative w-48 h-72 lg:w-64 lg:h-96 transition-all duration-500 ${
            activeAnchor === 'left' 
              ? 'scale-105 z-20 brightness-110' 
              : 'scale-95 opacity-60 brightness-75'
          }`}
          style={{
            animation: activeAnchor === 'left' && characterState === 'speaking' 
              ? 'breathing 3s ease-in-out infinite' 
              : 'none',
            transform: `rotate(${headTilt}deg) translateY(${shoulderMove}px)`,
            filter: activeAnchor === 'left' 
              ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' 
              : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
          }}
        >
          <img 
            src={anchorLeftImg} 
            alt="News Anchor"
            className="w-full h-full object-cover object-top rounded-t-lg shadow-2xl"
          />
          
          {/* Better mouth animation */}
          {activeAnchor === 'left' && characterState === 'speaking' && (
            <MouthAnimation isOpen={mouthOpen} position="left" />
          )}
          
          {/* Eye blinking */}
          {leftBlinking && (
            <div className="absolute top-[32%] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-skin-tone" 
                 style={{ backgroundColor: 'rgba(237, 216, 206, 0.95)' }} />
          )}
          
          {/* Studio lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
        </div>

        {/* Right Anchor */}
        <div 
          className={`relative w-48 h-72 lg:w-64 lg:h-96 transition-all duration-500 ${
            activeAnchor === 'right' 
              ? 'scale-105 z-20 brightness-110' 
              : 'scale-95 opacity-60 brightness-75'
          }`}
          style={{
            animation: activeAnchor === 'right' && characterState === 'speaking' 
              ? 'breathing 3s ease-in-out infinite 0.5s' 
              : 'none',
            transform: `rotate(${-headTilt}deg) translateY(${shoulderMove}px)`,
            filter: activeAnchor === 'right' 
              ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' 
              : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
          }}
        >
          <img 
            src={anchorRightImg} 
            alt="News Anchor"
            className="w-full h-full object-cover object-top rounded-t-lg shadow-2xl"
          />
          
          {/* Better mouth animation */}
          {activeAnchor === 'right' && characterState === 'speaking' && (
            <MouthAnimation isOpen={mouthOpen} position="right" />
          )}
          
          {/* Eye blinking */}
          {rightBlinking && (
            <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-skin-tone" 
                 style={{ backgroundColor: 'rgba(237, 216, 206, 0.95)' }} />
          )}
          
          {/* Studio lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Enhanced Speech Bubble with fade transitions */}
      {displayedText && (
        <div className="absolute bottom-24 md:bottom-28 lg:bottom-32 left-1/2 transform -translate-x-1/2 max-w-[90vw] md:max-w-3xl lg:max-w-4xl w-full px-4 sm:px-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative bg-gradient-to-r from-card/98 to-card/95 backdrop-blur-md border-2 border-primary/40 rounded-xl shadow-2xl overflow-hidden max-h-[40vh]">
            <div className={`h-1 ${
              !isMuted && ttsLoading 
                ? 'bg-gradient-to-r from-primary via-primary/60 to-primary animate-pulse' 
                : 'bg-gradient-to-r from-primary via-primary/60 to-transparent'
            }`} />
            
            <div className="p-4 md:p-5 overflow-y-auto scroll-smooth max-h-[35vh]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/20 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-black text-primary uppercase tracking-wider">
                    {anchorName}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {anchorTitle}
                  </span>
                  {!isMuted && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-primary font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        AI VOICE
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  HACKCAST LIVE
                </div>
              </div>
              
              <p className="text-base md:text-lg text-foreground leading-relaxed font-medium break-words">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-1.5 h-5 ml-1 bg-primary animate-pulse" />
                )}
              </p>
            </div>
            
            {/* Gradient fade indicator for long text */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/95 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* Breathing animation keyframes */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.01); }
        }
      `}</style>
    </div>
  );
}
