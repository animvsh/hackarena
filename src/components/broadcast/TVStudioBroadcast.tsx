import { useEffect } from 'react';
import { StudioBackground } from './StudioBackground';
import { BroadcastCharacter } from './BroadcastCharacter';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { StatPanel } from './StatPanel';
import { useSceneRotation } from '@/hooks/useSceneRotation';
import { useAIBroadcastContent } from '@/hooks/useAIBroadcastContent';
import { useVAPIVoice } from '@/hooks/useVAPIVoice';

export function TVStudioBroadcast() {
  const { currentScene } = useSceneRotation(30000);
  const { commentary, tickerItems, bannerText, isLive } = useAIBroadcastContent();
  const { speak, isSpeaking } = useVAPIVoice();

  useEffect(() => {
    if (commentary?.text) {
      // Trigger voice synthesis when new commentary appears
      speak(commentary.text);
    }
  }, [commentary?.id, commentary?.text, speak]);

  const showStatPanel = currentScene === 'market' || currentScene === 'stats';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Static background layer */}
      <StudioBackground scene={currentScene} />

      {/* AI Character with speech bubble */}
      {commentary && (
        <BroadcastCharacter 
          narrative={commentary.text} 
          isLive={isLive}
          isSpeaking={isSpeaking}
        />
      )}

      {/* Lower third banner with AI text */}
      {bannerText && (
        <LowerThirdBanner
          teamName={bannerText.team_name || 'Live'}
          metric={bannerText.text}
          value={0}
          change={0}
        />
      )}

      {/* Stat panel (visible on certain scenes) */}
      <StatPanel visible={showStatPanel} />

      {/* Bottom ticker tape with AI content */}
      <TickerTape items={tickerItems} />

      {/* Scene indicator (debug mode) */}
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20 z-50">
        <p className="text-xs font-mono text-muted-foreground">
          Scene: <span className="text-primary font-bold uppercase">{currentScene}</span>
          {isLive && <span className="ml-2 text-success">● LIVE</span>}
        </p>
      </div>
    </div>
  );
}
