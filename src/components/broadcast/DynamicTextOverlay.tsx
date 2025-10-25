import { useState, useEffect } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

interface DynamicTextOverlayProps {
  narrative: string;
  scene: BroadcastScene;
}

export function DynamicTextOverlay({ narrative, scene }: DynamicTextOverlayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!narrative) return;

    setIsTyping(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    const typingSpeed = 30; // ms per character

    const typeInterval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [narrative]);

  const getPositionClass = () => {
    switch (scene) {
      case 'anchor':
        return 'top-1/4 left-1/2 -translate-x-1/2 text-center max-w-4xl';
      case 'team':
        return 'bottom-1/3 left-8 max-w-2xl';
      case 'market':
        return 'top-1/3 right-8 max-w-2xl text-right';
      case 'stats':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-3xl';
      case 'highlight':
        return 'bottom-1/4 left-1/2 -translate-x-1/2 text-center max-w-4xl';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-4xl';
    }
  };

  if (!narrative) return null;

  return (
    <div className={`absolute ${getPositionClass()} z-20 animate-in fade-in duration-500`}>
      <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        {displayedText}
        {isTyping && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
}
