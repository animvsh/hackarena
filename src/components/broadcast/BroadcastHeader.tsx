interface BroadcastHeaderProps {
  currentScene: string;
  isLive: boolean;
}

export function BroadcastHeader({ currentScene, isLive }: BroadcastHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-8 bg-muted/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-3 z-40">
      {/* LIVE indicator */}
      <div className="flex items-center gap-2">
        {isLive && (
          <>
            <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              LIVE
            </span>
          </>
        )}
      </div>

      {/* Scene indicator */}
      <span className="text-xs font-mono text-muted-foreground uppercase">
        {currentScene}
      </span>
    </div>
  );
}
