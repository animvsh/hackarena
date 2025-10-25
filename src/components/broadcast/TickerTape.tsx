interface BroadcastContentItem {
  id: string;
  text: string;
  team_name: string;
  priority: string;
}

interface TickerTapeProps {
  items?: BroadcastContentItem[];
}

export function TickerTape({ items = [] }: TickerTapeProps) {
  // Use provided items or fallback to empty array
  const displayItems = items.length > 0 ? items : [
    { id: '1', text: 'Waiting for live updates...', team_name: 'System', priority: 'normal' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-card/90 border-t border-primary/20 overflow-hidden">
      <div className="flex items-center h-full">
        {/* Scrolling ticker content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-scroll flex gap-8">
            {[...displayItems, ...displayItems, ...displayItems].map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                <span className={`text-xs ${item.priority === 'breaking' ? 'text-destructive' : 'text-primary'}`}>●</span>
                <span className="text-xs font-medium text-foreground">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
