import { useState, useEffect } from 'react';
import broadcastHost from '@/assets/broadcast-host.jpg';

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
    <div className="flex items-end gap-3 animate-in slide-in-from-bottom-2 duration-500">
      {/* Broadcast Host Image */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/40 shadow-xl">
          <img 
            src={broadcastHost} 
            alt="Broadcast Host" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Speaking animation ring */}
        {characterState === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        )}
        
        {/* Live indicator */}
        {isLive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse ring-2 ring-background" />
        )}
      </div>

      {/* Speech Bubble */}
      <div className="relative bg-card/95 backdrop-blur-sm border-2 border-primary/40 rounded-2xl px-4 py-3 max-w-md shadow-2xl">
        {/* Bubble tail pointing to host */}
        <div className="absolute -left-2 bottom-6 w-4 h-4 bg-card border-l-2 border-b-2 border-primary/40 transform rotate-45" />
        
        {/* Content */}
        <div className="relative">
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {displayedText || narrative}
            {isTyping && <span className="animate-pulse text-primary ml-0.5">|</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
