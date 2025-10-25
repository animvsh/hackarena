import { useState, useEffect } from 'react';
import anchorLeft from '@/assets/news-anchor-left.png';
import anchorRight from '@/assets/news-anchor-right.png';

interface BroadcastCharacterProps {
  narrative: string;
  isLive: boolean;
  isSpeaking?: boolean;
}

type CharacterState = 'idle' | 'speaking' | 'excited';

export function BroadcastCharacter({ narrative, isLive, isSpeaking = false }: BroadcastCharacterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterState, setCharacterState] = useState<CharacterState>('idle');

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
        currentIndex++;
      } else {
        setIsTyping(false);
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
    <div className="absolute inset-0 flex items-center justify-center z-10">
      {/* News Anchors Container - Centered and positioned to sit at desk */}
      <div className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 flex items-end gap-8 lg:gap-16">
        {/* Left Anchor */}
        <div className="relative">
          <img 
            src={anchorLeft}
            alt="News Anchor" 
            className="w-32 h-32 lg:w-48 lg:h-48 object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
              animation: characterState === 'speaking' ? 'breathing 3s ease-in-out infinite' : 'none'
            }}
          />
          {isLive && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-destructive rounded-full animate-pulse ring-2 ring-white shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Right Anchor */}
        <div className="relative">
          <img 
            src={anchorRight}
            alt="News Anchor" 
            className="w-32 h-32 lg:w-48 lg:h-48 object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
              animation: characterState === 'speaking' ? 'breathing 3s ease-in-out infinite 0.5s' : 'none'
            }}
          />
        </div>
      </div>

      {/* Professional Speech Bubble - positioned above anchors */}
      <div className="absolute bottom-[45%] left-1/2 transform -translate-x-1/2 max-w-2xl w-[90%] z-20">
        <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-6 py-4 shadow-2xl">
          {/* Bubble tail pointing down to anchors */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/95 border-b border-r border-gray-200 rotate-45" />
          
          {/* Content */}
          <div className="relative">
            <p className="text-sm lg:text-base font-medium text-gray-900 leading-relaxed text-center">
              {displayedText || narrative}
              {isTyping && <span className="animate-pulse text-[#2563eb] ml-0.5">|</span>}
            </p>
          </div>
          
          {/* Speaking indicator */}
          {characterState === 'speaking' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2563eb] rounded-full animate-pulse" />
          )}
        </div>
      </div>

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
