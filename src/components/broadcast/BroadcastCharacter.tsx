import { useState, useEffect } from 'react';

interface BroadcastCharacterProps {
  narrative: string;
  isLive: boolean;
  isSpeaking?: boolean;
}

type CharacterState = 'idle' | 'speaking' | 'excited';

// SVG News Anchor Components
const AnchorLeft = ({ isAnimated }: { isAnimated: boolean }) => (
  <svg viewBox="0 0 200 350" className="w-full h-full">
    {/* Head */}
    <circle cx="100" cy="70" r="40" fill="#ffd4a3" />
    {/* Hair */}
    <path d="M60,50 Q70,25 100,30 Q130,25 140,50 L140,75 Q100,70 60,75 Z" fill="#8b4513" />
    {/* Eyes */}
    <circle cx="85" cy="70" r="6" fill="white" />
    <circle cx="115" cy="70" r="6" fill="white" />
    <circle cx="87" cy="72" r="3" fill="black" />
    <circle cx="117" cy="72" r="3" fill="black" />
    {/* Smile */}
    <path d="M80,85 Q100,95 120,85" stroke="#333" strokeWidth="2" fill="none" />
    {/* Blazer (Purple) */}
    <rect x="50" y="110" width="100" height="150" rx="8" fill="#8b5cf6" />
    {/* Shirt */}
    <rect x="85" y="110" width="30" height="100" fill="#f8fafc" />
    {/* Tie */}
    <polygon points="100,110 95,150 100,155 105,150" fill="#6b46c1" />
    {/* Lapels */}
    <path d="M50,110 L70,130 L85,110" fill="#7c3aed" />
    <path d="M150,110 L130,130 L115,110" fill="#7c3aed" />
  </svg>
);

const AnchorRight = ({ isAnimated }: { isAnimated: boolean }) => (
  <svg viewBox="0 0 200 350" className="w-full h-full">
    {/* Head */}
    <circle cx="100" cy="70" r="40" fill="#ffd4a3" />
    {/* Hair */}
    <path d="M60,45 Q100,20 140,45 L140,75 Q100,65 60,75 Z" fill="#4a3020" />
    {/* Eyes */}
    <circle cx="85" cy="70" r="6" fill="white" />
    <circle cx="115" cy="70" r="6" fill="white" />
    <circle cx="87" cy="72" r="3" fill="black" />
    <circle cx="117" cy="72" r="3" fill="black" />
    {/* Smile */}
    <path d="M80,85 Q100,95 120,85" stroke="#333" strokeWidth="2" fill="none" />
    {/* Suit (Navy) */}
    <rect x="50" y="110" width="100" height="150" rx="8" fill="#1e40af" />
    {/* Shirt */}
    <rect x="85" y="110" width="30" height="100" fill="#f8fafc" />
    {/* Tie */}
    <polygon points="100,110 95,150 100,155 105,150" fill="#7c3aed" />
    {/* Lapels */}
    <path d="M50,110 L70,130 L85,110" fill="#1e3a8a" />
    <path d="M150,110 L130,130 L115,110" fill="#1e3a8a" />
  </svg>
);

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
    <div className="absolute inset-0 z-10">
      {/* News Anchors Container - Centered and positioned to sit at desk */}
      <div className="absolute bottom-[18%] left-1/2 transform -translate-x-1/2 flex items-end gap-12 lg:gap-20">
        {/* Left Anchor */}
        <div 
          className="relative w-40 h-56 lg:w-52 lg:h-72"
          style={{
            animation: characterState === 'speaking' ? 'breathing 3s ease-in-out infinite' : 'none'
          }}
        >
          <AnchorLeft isAnimated={characterState === 'speaking'} />
          {isLive && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-destructive rounded-full animate-pulse ring-2 ring-white shadow-lg" />
          )}
        </div>

        {/* Right Anchor */}
        <div 
          className="relative w-40 h-56 lg:w-52 lg:h-72"
          style={{
            animation: characterState === 'speaking' ? 'breathing 3s ease-in-out infinite 0.5s' : 'none'
          }}
        >
          <AnchorRight isAnimated={characterState === 'speaking'} />
        </div>
      </div>

      {/* Professional Speech Bubble - positioned above anchors */}
      <div className="absolute bottom-[52%] left-1/2 transform -translate-x-1/2 max-w-2xl w-[90%] z-25">
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
