import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  progress: number;
  isMuted: boolean;
  isPaused: boolean;
  isMasterUser: boolean;
  onPlayPause: () => void;
  onFullscreen: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export function VideoPlayerControls({
  isPlaying,
  isLive,
  progress,
  isMuted,
  isPaused,
  isMasterUser,
  onPlayPause,
  onFullscreen,
  onToggleMute,
  onTogglePause,
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

        {/* Right side - Pause (Master), Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Master User Pause Button */}
          {isMasterUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg backdrop-blur-sm transition-all duration-200 font-bold text-sm ${
                isPaused 
                  ? 'bg-green-500/90 hover:bg-green-500 hover:scale-105 text-white' 
                  : 'bg-amber-500/90 hover:bg-amber-500 hover:scale-105 text-white'
              }`}
              title={isPaused ? "Resume Broadcast (Master Only)" : "Pause Broadcast (Master Only)"}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RESUME</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>PAUSE</span>
                </>
              )}
            </button>
          )}

          {/* Mute/Unmute TTS control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Mute button clicked!');
              onToggleMute();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${
              isMuted 
                ? 'bg-red-500/80 hover:bg-red-500 hover:scale-110' 
                : 'bg-primary/80 hover:bg-primary hover:scale-110'
            }`}
            aria-label={isMuted ? 'Unmute commentary' : 'Mute commentary'}
            title={isMuted ? 'Click to Unmute AI Commentary' : 'Click to Mute AI Commentary'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

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
