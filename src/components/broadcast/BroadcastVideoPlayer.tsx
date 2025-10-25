import { useEffect } from 'react';
import { BroadcastCharacter } from './BroadcastCharacter';
import { BroadcastHeader } from './BroadcastHeader';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { useSceneRotation } from '@/hooks/useSceneRotation';
import { useAIBroadcastContent } from '@/hooks/useAIBroadcastContent';
import { useVAPIVoice } from '@/hooks/useVAPIVoice';

export function BroadcastVideoPlayer() {
  const { currentScene } = useSceneRotation(30000);
  const { commentary, tickerItems, bannerText, isLive } = useAIBroadcastContent();
  const { speak, isSpeaking } = useVAPIVoice();

  useEffect(() => {
    if (commentary?.text) {
      speak(commentary.text);
    }
  }, [commentary?.id, commentary?.text, speak]);

  return (
    <div className="w-full max-w-[450px] mx-auto">
      <div className="relative aspect-video bg-card border-2 border-border rounded-lg overflow-hidden shadow-xl">
        {/* Compact Header */}
        <BroadcastHeader currentScene={currentScene} isLive={isLive} />

        {/* Main content area with character */}
        <div className="absolute inset-0 flex items-end justify-start p-4 pt-16 pb-20">
          {commentary && (
            <BroadcastCharacter 
              narrative={commentary.text} 
              isLive={isLive}
              isSpeaking={isSpeaking}
            />
          )}
        </div>

        {/* Lower third banner */}
        {bannerText && (
          <LowerThirdBanner
            teamName={bannerText.team_name || 'Live'}
            metric={bannerText.text}
            value={0}
            change={0}
          />
        )}

        {/* Bottom ticker tape */}
        <TickerTape items={tickerItems} />
      </div>
    </div>
  );
}
