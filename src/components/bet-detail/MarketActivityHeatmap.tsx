import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActivityData {
  hour: number;
  betCount: number;
  totalVolume: number;
}

export function MarketActivityHeatmap() {
  // Generate mock data for 24 hours
  const activityData: ActivityData[] = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      betCount: Math.floor(Math.random() * 50),
      totalVolume: Math.floor(Math.random() * 5000),
    }));
  }, []);

  const maxVolume = Math.max(...activityData.map(d => d.totalVolume));
  const currentHour = new Date().getHours();

  const getIntensity = (volume: number) => {
    const ratio = volume / maxVolume;
    if (ratio > 0.75) return 'bg-primary';
    if (ratio > 0.5) return 'bg-neon-blue';
    if (ratio > 0.25) return 'bg-neon-purple/60';
    return 'bg-muted';
  };

  const peakHour = activityData.reduce((max, curr) =>
    curr.totalVolume > max.totalVolume ? curr : max
  , activityData[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>24-Hour Activity Heatmap</CardTitle>
        <CardDescription>
          Betting volume by hour • Peak: {peakHour.hour}:00 ({peakHour.totalVolume} HC)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {/* Heatmap grid */}
            <div className="grid grid-cols-12 gap-2">
              {activityData.map((data) => (
                <Tooltip key={data.hour}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        aspect-square rounded-md transition-all duration-300 cursor-pointer
                        ${getIntensity(data.totalVolume)}
                        ${data.hour === currentHour ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}
                        hover:scale-110 hover:shadow-lg
                      `}
                    >
                      {data.hour === peakHour.hour && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">{data.hour}:00 - {data.hour + 1}:00</p>
                      <p>{data.betCount} bets</p>
                      <p>{data.totalVolume} HC volume</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Hour labels */}
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground text-center">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="col-span-2">
                  {i * 2}h
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-purple/60 rounded" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-blue rounded" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded" />
                <span>Peak</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
