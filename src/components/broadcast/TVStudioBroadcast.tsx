import { useEffect } from 'react';
import { StudioBackground } from './StudioBackground';
import { DynamicTextOverlay } from './DynamicTextOverlay';
import { LowerThirdBanner } from './LowerThirdBanner';
import { TickerTape } from './TickerTape';
import { StatPanel } from './StatPanel';
import { useSceneRotation } from '@/hooks/useSceneRotation';
import { useBroadcastContent } from '@/hooks/useBroadcastContent';
import { useVAPIVoice } from '@/hooks/useVAPIVoice';

export function TVStudioBroadcast() {
  const { currentScene } = useSceneRotation(30000);
  const { content, isLive } = useBroadcastContent();
  const { speak } = useVAPIVoice();

  const currentContent = content[0];

  useEffect(() => {
    if (currentContent?.narrative) {
      // Trigger voice synthesis when new narrative appears
      speak(currentContent.narrative);
    }
  }, [currentContent?.id, currentContent?.narrative, speak]);

  const showStatPanel = currentScene === 'market' || currentScene === 'stats';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Static background layer */}
      <StudioBackground scene={currentScene} />

      {/* Dynamic text overlay */}
      {currentContent && (
        <DynamicTextOverlay 
          narrative={currentContent.narrative} 
          scene={currentScene}
        />
      )}

      {/* Lower third banner */}
      {currentContent && (
        <LowerThirdBanner
          teamName={currentContent.teamName}
          metric={currentContent.metricType}
          value={currentContent.currentValue}
          change={currentContent.change}
        />
      )}

      {/* Stat panel (visible on certain scenes) */}
      <StatPanel visible={showStatPanel} />

      {/* Bottom ticker tape */}
      <TickerTape />

      {/* Scene indicator (debug mode - can be removed) */}
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20 z-50">
        <p className="text-xs font-mono text-muted-foreground">
          Scene: <span className="text-primary font-bold uppercase">{currentScene}</span>
          {isLive && <span className="ml-2 text-success">● LIVE</span>}
        </p>
      </div>
    </div>
  );
}
