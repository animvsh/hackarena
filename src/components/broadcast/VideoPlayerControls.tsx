import { Play, Pause, Maximize, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  progress: number;
  onPlayPause: () => void;
  onFullscreen: () => void;
}

export function VideoPlayerControls({
  isPlaying,
  isLive,
  progress,
  onPlayPause,
  onFullscreen,
}: VideoPlayerControlsProps) {
  return (
    <div className="relative px-4 pb-4 pt-2">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Play/Pause */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>

          {/* Live indicator */}
          {isLive && isPlaying && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/90 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live
              </span>
            </div>
          )}
        </div>

        {/* Right side - Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Volume control (placeholder for future voice) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Volume2 className="w-4 h-4 text-white" />
            <Slider
              value={[80]}
              max={100}
              step={1}
              className="w-20"
              disabled
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFullscreen();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
