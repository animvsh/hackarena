export function NewsDeskOverlay() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[22%] pointer-events-none z-20">
      {/* Professional news desk with realistic materials */}
      <div className="relative h-full">
        {/* Main desk surface - rich wood with realistic texture */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #8B5A3C 0%, #6B4423 40%, #4A2F1A 70%, #3D2515 100%)',
          }}
        >
          {/* Realistic wood grain texture */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, 
                  transparent, transparent 3px, 
                  rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 6px
                ),
                repeating-linear-gradient(0deg,
                  transparent, transparent 1px,
                  rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px
                )
              `,
            }}
          />
          
          {/* High-gloss studio lighting reflection */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 100%)',
            }}
          />
          
          {/* Specular highlights from studio lights */}
          <div 
            className="absolute top-0 left-1/4 w-1/2 h-1/3 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
            }}
          />
        
        {/* Professional desk props with realistic details */}
        
        {/* News script papers with text */}
        <div className="absolute top-3 left-6 w-20 h-24 bg-white/95 rounded shadow-xl transform -rotate-6"
          style={{
            boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <div className="p-2 text-[7px] text-gray-900 font-serif leading-relaxed">
            <div className="font-bold mb-1">BREAKING NEWS</div>
            <div className="opacity-70">Market volatility continues as teams compete...</div>
          </div>
        </div>
        
        {/* Second paper stack */}
        <div className="absolute top-4 right-8 w-24 h-20 bg-white/90 rounded shadow-xl transform rotate-3"
          style={{
            boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <div className="p-2 text-[6px] text-gray-800 leading-tight">
            <div className="font-semibold mb-1">Team Rankings</div>
            <div className="opacity-60">Latest data shows significant shifts in predictions...</div>
          </div>
        </div>

        {/* Tablet device on desk */}
        <div className="absolute top-2 left-1/3 w-16 h-12 bg-gray-900 rounded shadow-2xl transform -rotate-2"
          style={{
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded flex items-center justify-center">
            <div className="text-[6px] text-white/60">Live Data</div>
          </div>
        </div>

        {/* Coffee mug */}
        <div className="absolute bottom-2 right-1/4 w-6 h-8">
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-300 rounded-b-lg shadow-xl relative"
            style={{
              boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {/* Handle */}
            <div className="absolute right-0 top-1/3 w-2 h-3 border-2 border-gray-300 rounded-r-full" />
            {/* Coffee inside */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-5 bg-gradient-to-b from-amber-900 to-amber-950 rounded-b-lg" />
          </div>
        </div>

        {/* LED-backlit HACKCAST LIVE logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* LED glow effect */}
            <div className="absolute inset-0 bg-primary/50 blur-lg rounded-lg" />
            {/* Main logo plate */}
            <div className="relative bg-gradient-to-r from-primary via-primary-glow to-primary px-8 py-3 rounded shadow-2xl border-2 border-white/30"
              style={{
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            >
              <div className="text-white font-bold text-base lg:text-xl tracking-widest"
                style={{
                  textShadow: '0 0 10px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                HACKCAST LIVE
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
