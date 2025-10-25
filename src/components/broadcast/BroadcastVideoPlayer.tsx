import { useEffect } from 'react';
import { BroadcastCharacter } from './BroadcastCharacter';
import { BroadcastHeader } from './BroadcastHeader';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { LiveViewersCounter } from './LiveViewersCounter';
import { NewsStudioBackground } from './NewsStudioBackground';
import { NewsDeskOverlay } from './NewsDeskOverlay';
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
        {/* Professional News Studio Background */}
        <NewsStudioBackground scene={currentScene} />
        
        {/* Compact Header */}
        <BroadcastHeader currentScene={currentScene} isLive={isLive} />
        
        {/* Live Viewers Counter */}
        <div className="absolute top-4 right-4 z-30">
          <LiveViewersCounter />
        </div>

        {/* News Anchors positioned at desk level */}
        <BroadcastCharacter 
          narrative={commentary?.text || "Good evening, and welcome to HackCast Live. We're bringing you real-time coverage from the hackathon floor..."} 
          isLive={isLive}
          isSpeaking={isSpeaking}
        />

        {/* News Desk Overlay (foreground - in front of anchors) */}
        <NewsDeskOverlay />

        {/* Lower third banner */}
        {bannerText && (
          <LowerThirdBanner
            teamName={bannerText.team_name || 'Breaking'}
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
