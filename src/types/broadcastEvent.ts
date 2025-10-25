export type BroadcastEventType = 
  | 'bet_placed' 
  | 'market_created' 
  | 'odds_change' 
  | 'team_update' 
  | 'milestone'
  | 'prediction_won'
  | 'prediction_lost';

export type FillerContentType = 
  | 'member_spotlight' 
  | 'team_analysis' 
  | 'historical_stat' 
  | 'prediction' 
  | 'fun_fact';

export interface BroadcastEvent {
  id: string;
  type: BroadcastEventType;
  priority: 'breaking' | 'normal' | 'background';
  teamName?: string;
  teamId?: string;
  metricType: string;
  currentValue: number;
  change: number;
  timestamp: string;
  metadata?: any;
}

export interface FillerContent {
  id: string;
  type: FillerContentType;
  text: string;
  teamName?: string;
  priority: 'normal' | 'background';
  timestamp: string;
}

export interface BroadcastQueueItem {
  id: string;
  content_type: 'commentary' | 'ticker' | 'banner';
  text: string;
  team_name?: string;
  priority: 'breaking' | 'normal' | 'background';
  duration: number;
  isRealEvent: boolean;
  created_at: string;
}

export interface BroadcastContentItem {
  id: string;
  content_type: 'commentary' | 'ticker' | 'banner';
  text: string;
  team_name?: string;
  priority: 'breaking' | 'normal' | 'background';
  duration: number;
  created_at: string;
}
