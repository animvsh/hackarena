import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

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

  if (!narrative) return null;

  return (
    <div className="flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-500">
      {/* Speech Bubble */}
      <div className="relative bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 max-w-xs shadow-lg">
        {/* Bubble tail */}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-card border-l border-b border-primary/30 transform rotate-45" />
        
        {/* Content */}
        <div className="relative">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {displayedText}
            {isTyping && <span className="animate-pulse text-primary">|</span>}
          </p>
        </div>
      </div>

      {/* Character Avatar */}
      <div className="relative mb-1 flex-shrink-0">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCharacterColor()} flex items-center justify-center shadow-md ring-2 ring-background`}>
          <Mic className={`w-6 h-6 text-background ${characterState === 'speaking' ? 'animate-pulse' : ''}`} />
        </div>
        
        {/* Speaking animation ring */}
        {characterState === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
      </div>
    </div>
  );
}
