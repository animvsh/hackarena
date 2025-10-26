import { useState } from 'react';
import { useLiveSimulation } from '@/hooks/useLiveSimulation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  Radio,
  Settings,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SimulationController() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { config, stats, updateConfig, resetStats, manualTrigger, isRunning } = useLiveSimulation();

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="gap-2 shadow-lg"
          variant={isRunning ? "default" : "outline"}
        >
          <Radio className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
          Simulation {isRunning ? 'ON' : 'OFF'}
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className={`w-5 h-5 text-primary ${isRunning ? 'animate-pulse' : ''}`} />
          <h3 className="font-bold text-sm">Live Simulation</h3>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 p-3 bg-background/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
            {isRunning ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                PAUSED
              </>
            )}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Events</p>
            <p className="font-bold text-primary">{stats.eventsGenerated}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Update</p>
            <p className="font-bold">
              {stats.lastUpdate ? formatDistanceToNow(stats.lastUpdate, { addSuffix: true }) : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Power Switch */}
        <div className="flex items-center justify-between p-2 bg-background/50 rounded">
          <span className="text-sm font-medium">Enable Simulation</span>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </div>

        {/* Interval Speed */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Update Speed</label>
          <Select
            value={config.interval.toString()}
            onValueChange={(value) => updateConfig({ interval: parseInt(value) })}
            disabled={!config.enabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">🚀 Very Fast (5s)</SelectItem>
              <SelectItem value="10000">⚡ Fast (10s)</SelectItem>
              <SelectItem value="15000">⭐ Normal (15s)</SelectItem>
              <SelectItem value="30000">🐢 Slow (30s)</SelectItem>
              <SelectItem value="60000">🕐 Very Slow (60s)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Intensity</label>
          <Select
            value={config.intensity}
            onValueChange={(value: 'low' | 'medium' | 'high') => updateConfig({ intensity: value })}
            disabled={!config.enabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🌱 Low (1-2 events)</SelectItem>
              <SelectItem value="medium">🔥 Medium (3-5 events)</SelectItem>
              <SelectItem value="high">⚡ High (6-9 events)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={manualTrigger}
            className="flex-1 gap-2"
            disabled={isRunning}
          >
            <Zap className="w-3 h-3" />
            Trigger Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetStats}
            className="gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Recent Events */}
      {stats.eventHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {stats.eventHistory.slice(0, 3).map((event, i) => (
              <div key={i} className="text-xs p-1.5 bg-background/30 rounded text-muted-foreground">
                <div className="flex justify-between">
                  <span className="truncate">
                    {Array.isArray(event.data) ? `${event.data.length} events` : 'Event triggered'}
                  </span>
                  <span className="text-xs opacity-60">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dev Mode Badge */}
      <div className="mt-3 pt-3 border-t border-border">
        <Badge variant="outline" className="w-full justify-center gap-1 text-xs">
          <Settings className="w-3 h-3" />
          Development Mode
        </Badge>
      </div>
    </Card>
  );
}
