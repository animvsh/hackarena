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
    <div className="absolute bottom-20 left-8 z-30 flex items-end gap-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Speech Bubble */}
      <div className="relative bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-2xl px-6 py-4 max-w-2xl shadow-2xl">
        {/* Bubble tail */}
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-card border-l-2 border-b-2 border-primary/30 transform rotate-45" />
        
        {/* Content */}
        <div className="relative">
          <p className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse text-primary">|</span>}
          </p>
          
          {/* Live indicator inside bubble */}
          {isLive && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary/20">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                LIVE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Character Avatar */}
      <div className="relative mb-2">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getCharacterColor()} flex items-center justify-center shadow-lg ring-4 ring-background`}>
          <Mic className={`w-12 h-12 text-background ${characterState === 'speaking' ? 'animate-pulse' : ''}`} />
        </div>
        
        {/* Speaking animation ring */}
        {characterState === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
      </div>
    </div>
  );
}
