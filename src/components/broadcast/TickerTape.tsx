import { motion } from 'framer-motion';
import { TrendingUp, Trophy, DollarSign, Zap, AlertCircle } from 'lucide-react';
import type { BroadcastContentItem } from '@/types/broadcastEvent';

interface TickerTapeProps {
  items?: BroadcastContentItem[];
}

export function TickerTape({ items = [] }: TickerTapeProps) {
  const displayItems = items.length > 0 ? items : [
    { id: '1', text: 'Waiting for live updates...', team_name: 'System', priority: 'normal' as const, content_type: 'ticker' as const, duration: 0, created_at: new Date().toISOString() }
  ];

  // Separate items by priority for multi-lane display
  const breakingItems = displayItems.filter(item => item.priority === 'breaking');
  const normalItems = displayItems.filter(item => item.priority !== 'breaking');

  const getIcon = (item: BroadcastContentItem) => {
    if (item.priority === 'breaking') return AlertCircle;
    if (item.team_name?.toLowerCase().includes('bet')) return DollarSign;
    if (item.text?.toLowerCase().includes('milestone')) return Trophy;
    if (item.text?.toLowerCase().includes('surge') || item.text?.toLowerCase().includes('odds')) return TrendingUp;
    return Zap;
  };

  const renderTickerLane = (laneItems: BroadcastContentItem[], speed: number = 60, colorClass: string = 'text-foreground/90') => {
    if (laneItems.length === 0) return null;
    
    const duplicatedItems = [...laneItems, ...laneItems, ...laneItems];

    return (
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex gap-6 items-center absolute left-0"
          animate={{ x: [0, -2000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
        >
          {duplicatedItems.map((item, index) => {
            const Icon = getIcon(item);
            return (
              <div key={`${item.id}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
                  {item.team_name && (
                    <span className={`text-xs font-bold ${colorClass} uppercase`}>
                      {item.team_name}
                    </span>
                  )}
                </div>
                
                <span className={`text-xs font-medium ${colorClass}`}>
                  {item.text}
                </span>
                
                <div className="w-1 h-1 bg-primary/40 rounded-full" />
              </div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Breaking news lane (top) - RED */}
      {breakingItems.length > 0 && (
        <div className="h-7 bg-gradient-to-r from-destructive/95 via-destructive to-destructive/95 backdrop-blur-md border-t border-destructive/50 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="flex-shrink-0 bg-destructive px-3 h-full flex items-center border-r border-white/20">
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-[10px] font-black text-white tracking-widest flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                BREAKING
              </motion.span>
            </div>
            {renderTickerLane(breakingItems, 45, 'text-white font-semibold')}
          </div>
        </div>
      )}
      
      {/* Main ticker lane (bottom) */}
      <div className="h-9 bg-gradient-to-r from-card/98 via-card/95 to-card/98 backdrop-blur-md border-t-2 border-primary/30 overflow-hidden shadow-lg">
        <div className="flex items-center h-full">
          <div className="px-3 bg-primary/15 h-full flex items-center border-r-2 border-primary/30 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                LIVE FEED
              </span>
            </div>
          </div>
          
          {renderTickerLane(normalItems.length > 0 ? normalItems : displayItems, 60, 'text-foreground/90')}
        </div>
      </div>
    </div>
  );
}
