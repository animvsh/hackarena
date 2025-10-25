export function NewsDeskOverlay() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[22%] z-20 pointer-events-none">
      {/* Desk surface with wood grain gradient */}
      <div className="relative w-full h-full bg-gradient-to-b from-desk-brown via-[#4e342e] to-desk-brown-dark shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
        {/* Top edge highlight for depth */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6d4c41]/50 to-transparent" />
        
        {/* Subtle wood grain texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(139, 69, 19, 0.1) 2px,
            rgba(139, 69, 19, 0.1) 4px
          )`
        }} />

        {/* Papers scattered on desk */}
        <div className="absolute top-4 left-[15%] w-24 h-16 bg-paper/90 rounded-sm shadow-lg transform -rotate-6">
          <div className="p-2 space-y-1">
            <div className="h-1 bg-foreground/20 rounded w-3/4" />
            <div className="h-1 bg-foreground/20 rounded w-full" />
            <div className="h-1 bg-foreground/20 rounded w-2/3" />
          </div>
        </div>
        
        <div className="absolute top-6 right-[15%] w-28 h-20 bg-paper/90 rounded-sm shadow-lg transform rotate-3">
          <div className="p-2 space-y-1">
            <div className="h-1 bg-foreground/20 rounded w-full" />
            <div className="h-1 bg-foreground/20 rounded w-5/6" />
            <div className="h-1 bg-foreground/20 rounded w-3/4" />
            <div className="h-1 bg-foreground/20 rounded w-2/3" />
          </div>
        </div>

        {/* Nameplate/Branding */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-b from-[#9ca3af] to-[#6b7280] rounded-sm shadow-xl border-t border-white/30">
          <span className="text-xs font-bold text-white tracking-wider drop-shadow-lg">
            HACKCAST LIVE
          </span>
        </div>
      </div>
    </div>
  );
}
