import { useEffect } from 'react';
import { BroadcastCharacter } from './BroadcastCharacter';
import { BroadcastHeader } from './BroadcastHeader';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { LiveViewersCounter } from './LiveViewersCounter';
import { NewsStudioBackground } from './NewsStudioBackground';
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
    <div className="w-full">
      <div className="relative aspect-video bg-gradient-to-br from-card via-card to-secondary/30 border border-border rounded-2xl overflow-hidden shadow-2xl hover-lift">
        {/* News Studio Background */}
        <NewsStudioBackground scene={currentScene} />
        
        {/* Compact Header */}
        <BroadcastHeader currentScene={currentScene} isLive={isLive} />
        
        {/* Live Viewers Counter */}
        <div className="absolute top-4 right-4 z-30">
          <LiveViewersCounter />
        </div>

        {/* Host Character positioned behind desk */}
        <BroadcastCharacter 
          narrative={commentary?.text || "Standing by for live updates from the hackathon floor..."} 
          isLive={isLive}
          isSpeaking={isSpeaking}
        />

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
