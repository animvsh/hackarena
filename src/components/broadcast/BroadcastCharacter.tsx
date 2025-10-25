import { useState, useEffect } from 'react';
import anchorLeftImg from '@/assets/news-anchor-left.png';
import anchorRightImg from '@/assets/news-anchor-right.png';

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

  // Typing effect with mouth animation
  useEffect(() => {
    if (!narrative) return;

    setIsTyping(true);
    setDisplayedText('');
    setCharacterState('speaking');
    
    let currentIndex = 0;
    const typingSpeed = 30;

    const typeInterval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 1));
        // Animate mouth during typing (simulates speaking)
        setMouthOpen(prev => !prev);
        currentIndex++;
      } else {
        setIsTyping(false);
        setMouthOpen(false);
        setTimeout(() => {
          if (!isSpeaking) {
            setCharacterState('idle');
          }
        }, 2000);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [narrative, isSpeaking]);

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

  return (
    <div className="absolute inset-0 z-10">
      {/* News Anchors Container - Realistic photo anchors */}
      <div className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 flex items-end gap-8 lg:gap-16">
        {/* Left Anchor - Female in Purple Blazer */}
        <div 
          className={`relative w-48 h-72 lg:w-64 lg:h-96 transition-all duration-300 ${
            activeAnchor === 'left' && characterState === 'speaking' 
              ? 'scale-105 z-20' 
              : activeAnchor === 'right' && characterState === 'speaking'
              ? 'opacity-60 scale-95'
              : ''
          }`}
          style={{
            animation: activeAnchor === 'left' && characterState === 'speaking' 
              ? 'breathing 3s ease-in-out infinite' 
              : 'none'
          }}
        >
          <img 
            src={anchorLeftImg} 
            alt="News Anchor"
            className="w-full h-full object-cover object-top rounded-t-lg shadow-2xl"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
            }}
          />
          
          {/* Mouth animation overlay */}
          {activeAnchor === 'left' && mouthOpen && characterState === 'speaking' && (
            <div className="absolute bottom-[28%] left-1/2 transform -translate-x-1/2 w-3 h-2 bg-black/40 rounded-full transition-all duration-75" />
          )}
          
          {/* Eye blinking */}
          {leftBlinking && (
            <div className="absolute top-[32%] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-skin-tone" 
                 style={{ backgroundColor: 'rgba(237, 216, 206, 0.95)' }} />
          )}
          
          {/* Studio lighting effect on anchor */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
          
          {isLive && activeAnchor === 'left' && characterState === 'speaking' && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-destructive rounded-full animate-pulse ring-2 ring-white shadow-lg" />
          )}
        </div>

        {/* Right Anchor - Male in Navy Suit */}
        <div 
          className={`relative w-48 h-72 lg:w-64 lg:h-96 transition-all duration-300 ${
            activeAnchor === 'right' && characterState === 'speaking' 
              ? 'scale-105 z-20' 
              : activeAnchor === 'left' && characterState === 'speaking'
              ? 'opacity-60 scale-95'
              : ''
          }`}
          style={{
            animation: activeAnchor === 'right' && characterState === 'speaking' 
              ? 'breathing 3s ease-in-out infinite 0.5s' 
              : 'none'
          }}
        >
          <img 
            src={anchorRightImg} 
            alt="News Anchor"
            className="w-full h-full object-cover object-top rounded-t-lg shadow-2xl"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
            }}
          />
          
          {/* Mouth animation overlay */}
          {activeAnchor === 'right' && mouthOpen && characterState === 'speaking' && (
            <div className="absolute bottom-[28%] left-1/2 transform -translate-x-1/2 w-3 h-2 bg-black/40 rounded-full transition-all duration-75" />
          )}
          
          {/* Eye blinking */}
          {rightBlinking && (
            <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-skin-tone" 
                 style={{ backgroundColor: 'rgba(237, 216, 206, 0.95)' }} />
          )}
          
          {/* Studio lighting effect on anchor */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
          
          {isLive && activeAnchor === 'right' && characterState === 'speaking' && (
            <div className="absolute top-3 left-3 w-3 h-3 bg-destructive rounded-full animate-pulse ring-2 ring-white shadow-lg" />
          )}
        </div>
      </div>

      {/* Professional Speech Bubble - positioned above anchors */}
      {narrative && (
        <div className={`absolute bottom-[52%] transform -translate-y-0 max-w-2xl w-[90%] z-25 transition-all duration-500 ${
          activeAnchor === 'left' 
            ? 'left-[30%] -translate-x-1/2' 
            : 'left-[70%] -translate-x-1/2'
        }`}>
          <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Bubble tail pointing down to active anchor */}
            <div className={`absolute -bottom-3 transform w-6 h-6 bg-white/95 border-b border-r border-gray-200 rotate-45 transition-all duration-300 ${
              activeAnchor === 'left' ? 'left-[20%]' : 'right-[20%]'
            }`} />
            
            {/* Content */}
            <div className="relative min-h-[2rem]">
              <p className="text-sm lg:text-base font-medium text-gray-900 leading-relaxed text-left">
                {displayedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-[#2563eb] ml-1 animate-pulse" />}
              </p>
            </div>
            
            {/* Speaking indicator */}
            {characterState === 'speaking' && (
              <div className="absolute -top-1 -right-1 flex gap-1">
                <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
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
