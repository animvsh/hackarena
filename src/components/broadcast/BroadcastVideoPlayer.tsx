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
      <div className="relative aspect-video bg-gradient-to-br from-broadcast-blue to-broadcast-blue-dark border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Layer 0: Professional News Studio Background */}
        <div className="absolute inset-0 z-0">
          <NewsStudioBackground scene={currentScene} />
        </div>
        
        {/* Layer 1: News Anchors positioned at desk level */}
        <div className="absolute inset-0 z-10">
          <BroadcastCharacter 
            narrative={commentary?.text || "Good evening, and welcome to HackCast Live. We're bringing you real-time coverage from the hackathon floor where teams are competing in real-time."} 
            isLive={isLive}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Layer 2: News Desk Overlay (foreground - in front of anchors) */}
        <div className="absolute inset-0 z-20">
          <NewsDeskOverlay />
        </div>

        {/* Layer 3: Lower third banner */}
        {bannerText && (
          <div className="absolute inset-0 z-30">
            <LowerThirdBanner
              teamName={bannerText.team_name || 'Breaking News'}
              metric={bannerText.text}
              value={0}
              change={0}
            />
          </div>
        )}

        {/* Layer 4: Bottom ticker tape */}
        <div className="absolute inset-0 z-30">
          <TickerTape items={tickerItems} />
        </div>

        {/* Layer 5: Header & UI Elements */}
        <div className="absolute top-0 left-0 right-0 z-40">
          <BroadcastHeader currentScene={currentScene} isLive={isLive} />
        </div>
        
        {/* Live Viewers Counter */}
        <div className="absolute top-4 right-4 z-40">
          <LiveViewersCounter />
        </div>
      </div>
    </div>
  );
}
