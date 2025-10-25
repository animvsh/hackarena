import { TrendingUp, Trophy, Zap, AlertCircle } from 'lucide-react';
import type { BroadcastContentItem } from '@/types/broadcastEvent';

interface TickerTapeProps {
  items?: BroadcastContentItem[];
}

export function TickerTape({ items = [] }: TickerTapeProps) {
  const displayItems = items.length > 0 ? items : [
    { id: '1', text: 'Waiting for live updates...', team_name: 'System', priority: 'normal' }
  ];

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'breaking':
        return <AlertCircle className="w-3 h-3" />;
      case 'high':
        return <Zap className="w-3 h-3" />;
      default:
        return <TrendingUp className="w-3 h-3" />;
    }
  };

  const getBackgroundColor = (priority: string) => {
    switch (priority) {
      case 'breaking':
        return 'bg-destructive/30';
      case 'high':
        return 'bg-primary/30';
      default:
        return 'bg-accent/20';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-card/95 backdrop-blur-sm border-t-2 border-primary/40 overflow-hidden shadow-lg">
      <div className="flex items-center h-full">
        {/* Ticker label */}
        <div className="px-3 bg-primary/20 h-full flex items-center border-r-2 border-primary/40">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-wider">
              Live Feed
            </span>
          </div>
        </div>
        
        {/* Scrolling ticker content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-scroll flex gap-6">
            {[...displayItems, ...displayItems, ...displayItems].map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                {/* Icon and priority indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${getBackgroundColor(item.priority)}`}>
                  {getIcon(item.priority)}
                  <span className="text-xs font-bold text-foreground uppercase">
                    {item.team_name}
                  </span>
                </div>
                
                {/* Text content */}
                <span className="text-xs font-medium text-foreground">
                  {item.text}
                </span>
                
                {/* Separator */}
                <div className="w-1 h-4 bg-primary/30 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
