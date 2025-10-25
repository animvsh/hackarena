export type BroadcastScene = 'anchor' | 'team' | 'market' | 'stats' | 'highlight';

export interface BroadcastContent {
  id: string;
  teamName: string;
  narrative: string;
  metricType: string;
  currentValue: number;
  change: number;
  priority: 'breaking' | 'normal' | 'background';
  timestamp: string;
}

export interface TeamMetric {
  team_id: string;
  team_name: string;
  metric_type: string;
  value: number;
  change: number;
  timestamp: string;
}

export interface TickerItem {
  id: string;
  text: string;
  type: 'stat' | 'market' | 'achievement';
}
