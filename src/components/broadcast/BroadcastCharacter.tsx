import { useState, useEffect } from 'react';
import anchorLeftImg from '@/assets/news-anchor-left.png';
import anchorRightImg from '@/assets/news-anchor-right.png';
import { MouthAnimation } from './MouthAnimation';

interface BroadcastCharacterProps {
  narrative: string;
  isLive: boolean;
  isSpeaking?: boolean;
  activeAnchor?: 'left' | 'right';
}

type CharacterState = 'idle' | 'speaking' | 'excited';

export function BroadcastCharacter({ narrative, isLive, isSpeaking = false, activeAnchor = 'left' }: BroadcastCharacterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [leftBlinking, setLeftBlinking] = useState(false);
  const [rightBlinking, setRightBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [shoulderMove, setShoulderMove] = useState(0);

  // Smooth text reveal effect - updates when narrative changes
  useEffect(() => {
    if (!narrative) return;

    setIsTyping(true);
    setDisplayedText('');
    setCharacterState('speaking');
    
    let currentIndex = 0;
    const typingSpeed = 15; // Faster typing for more dynamic feel

    const typeInterval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 2)); // Show 2 chars at a time
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

    return () => clearInterval(typeInterval);
  }, [narrative, isSpeaking]); // Re-run when narrative changes

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

  // Subtle head movements and gestures
  useEffect(() => {
    const movementInterval = setInterval(() => {
      setHeadTilt(Math.random() * 4 - 2);
      setShoulderMove(Math.random() * 2 - 1);
    }, 4000);

    return () => clearInterval(movementInterval);
  }, []);

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
        <div className="absolute bottom-24 md:bottom-28 lg:bottom-32 left-1/2 transform -translate-x-1/2 max-w-4xl w-full px-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-card/98 to-card/95 backdrop-blur-md border-2 border-primary/40 rounded-xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-black text-primary uppercase tracking-wider">
                    {anchorName}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {anchorTitle}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  HACKCAST LIVE
                </div>
              </div>
              
              <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-1.5 h-5 ml-1 bg-primary animate-pulse" />
                )}
              </p>
            </div>
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
