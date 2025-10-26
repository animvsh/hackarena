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
        return 'top-[15%] left-1/2 -translate-x-1/2 text-center max-w-[90vw] md:max-w-3xl px-4';
      case 'team':
        return 'bottom-[35%] left-4 md:left-8 max-w-[85vw] md:max-w-xl px-4';
      case 'market':
        return 'top-[30%] right-4 md:right-8 max-w-[85vw] md:max-w-xl text-right px-4';
      case 'stats':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[90vw] md:max-w-2xl px-4';
      case 'highlight':
        return 'bottom-[25%] left-1/2 -translate-x-1/2 text-center max-w-[90vw] md:max-w-3xl px-4';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[90vw] md:max-w-3xl px-4';
    }
  };

  if (!narrative) return null;

  return (
    <div className={`absolute ${getPositionClass()} z-20 animate-in fade-in duration-500`}>
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/10 max-h-[25vh] overflow-hidden">
        <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-words line-clamp-4">
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
      </div>
    </div>
  );
}
