import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBroadcastQueue } from './useBroadcastQueue';
import { useBroadcastEvents } from './useBroadcastEvents';
import { useMemberSpotlight } from './useMemberSpotlight';
import { BroadcastActivityMonitor } from '@/utils/broadcastActivityMonitor';
import type { BroadcastEvent, FillerContent, BroadcastContentItem } from '@/types/broadcastEvent';

export function useAIBroadcastContent() {
  const [commentary, setCommentary] = useState<BroadcastContentItem | null>(null);
  const [tickerItems, setTickerItems] = useState<BroadcastContentItem[]>([]);
  const [bannerText, setBannerText] = useState<BroadcastContentItem | null>(null);
  const [isLive, setIsLive] = useState(true);
  
  const queue = useBroadcastQueue();
  const { generateSpotlight } = useMemberSpotlight();
  const activityMonitor = useRef(new BroadcastActivityMonitor());
  const fillerIntervalRef = useRef<NodeJS.Timeout>();

  // Handle real-time events
  const handleBroadcastEvent = useCallback(async (event: BroadcastEvent) => {
    console.log('📡 Broadcast event received:', event);
    activityMonitor.current.updateActivity();

    // Generate commentary for this event
    const content = await generateEventCommentary(event);
    if (content) {
      queue.addRealEvent(event, content);
    }
  }, [queue]);

  // Initialize real-time event listener
  useBroadcastEvents(handleBroadcastEvent);

  // Generate filler content when inactive
  const generateFillerContent = useCallback(async () => {
    const status = activityMonitor.current.getActivityStatus();
    
    if (status === 'active') return; // No filler needed

    // Clear old filler if real events come in
    if (queue.hasRealEvents) {
      queue.clearFiller();
      return;
    }

    // Generate member spotlight
    const spotlight = await generateSpotlight();
    if (spotlight) {
      queue.addFillerContent(spotlight);
    } else {
      // Generate generic filler
      const genericFiller = generateGenericFiller();
      queue.addFillerContent(genericFiller);
    }
  }, [queue, generateSpotlight]);

  // Filler content interval based on activity
  useEffect(() => {
    const updateFillerInterval = () => {
      const interval = activityMonitor.current.getFillerInterval();
      
      if (fillerIntervalRef.current) {
        clearInterval(fillerIntervalRef.current);
      }

      if (interval > 0) {
        fillerIntervalRef.current = setInterval(generateFillerContent, interval);
      }
    };

    updateFillerInterval();
    const checkInterval = setInterval(updateFillerInterval, 5000);

    return () => {
      clearInterval(checkInterval);
      if (fillerIntervalRef.current) {
        clearInterval(fillerIntervalRef.current);
      }
    };
  }, [generateFillerContent]);

  // Process queue and update display
  useEffect(() => {
    const processQueue = () => {
      const next = queue.getNext();
      if (!next) return;

      console.log('🎬 Broadcasting:', next);

      if (next.content_type === 'commentary') {
        setCommentary(next);
      } else if (next.content_type === 'banner') {
        setBannerText(next);
      } else if (next.content_type === 'ticker') {
        setTickerItems(prev => [...prev.slice(-4), next]);
      }

      // Clear after duration
      setTimeout(() => {
        if (next.content_type === 'commentary') {
          setCommentary(null);
        } else if (next.content_type === 'banner') {
          setBannerText(null);
        }
        processQueue();
      }, next.duration);
    };

    if (queue.hasContent && !commentary && !bannerText) {
      processQueue();
    }
  }, [queue, commentary, bannerText]);

  // Fetch initial tickers from database
  useEffect(() => {
    const loadInitialTickers = async () => {
      const { data } = await supabase
        .from('broadcast_content')
        .select('*')
        .eq('content_type', 'ticker')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const formattedData: BroadcastContentItem[] = data.map(item => ({
          id: item.id,
          content_type: item.content_type as 'commentary' | 'ticker' | 'banner',
          text: item.text,
          team_name: item.team_name || undefined,
          priority: item.priority as 'breaking' | 'normal' | 'background',
          duration: item.duration,
          created_at: item.created_at
        }));
        setTickerItems(formattedData);
      }
    };

    loadInitialTickers();
  }, []);

  return { commentary, tickerItems, bannerText, isLive };
}

// Generate commentary from real events
async function generateEventCommentary(event: BroadcastEvent): Promise<{
  text: string;
  content_type: 'commentary' | 'ticker' | 'banner';
  duration: number;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-broadcast-content', {
      body: {
        teamName: event.teamName,
        metricType: event.metricType,
        currentValue: event.currentValue,
        change: event.change,
        contentType: 'commentary',
        eventType: event.type
      }
    });

    if (error) throw error;

    return {
      text: data.content,
      content_type: 'commentary',
      duration: data.duration || 8000
    };
  } catch (error) {
    console.error('Failed to generate event commentary, using fallback:', error);
    
    // Fallback to template-based commentary
    return {
      text: generateFallbackCommentary(event),
      content_type: 'commentary',
      duration: 8000
    };
  }
}

// Generate fallback commentary when AI fails
function generateFallbackCommentary(event: BroadcastEvent): string {
  switch (event.type) {
    case 'bet_placed':
      if (event.currentValue > 500) {
        return `🔥 HUGE BET just placed on ${event.teamName}! ${event.currentValue} coins on the line!`;
      }
      return `${event.teamName} receives a ${event.currentValue} coin bet. The stakes are rising!`;
    
    case 'odds_change':
      if (Math.abs(event.change) > 15) {
        return `BREAKING: ${event.teamName}'s odds just ${event.change > 0 ? 'SURGED' : 'PLUMMETED'} by ${Math.abs(event.change).toFixed(1)}%! Major market movement!`;
      }
      return `${event.teamName} odds ${event.change > 0 ? 'up' : 'down'} ${Math.abs(event.change).toFixed(1)}%. The market is reacting!`;
    
    case 'team_update':
      if (event.change >= 10) {
        return `${event.teamName} makes MASSIVE progress! +${event.change} points in one move! They're on fire!`;
      }
      return `${event.teamName} advances with +${event.change} progress. Steady momentum building!`;
    
    case 'milestone':
      return `🎯 MILESTONE REACHED! ${event.teamName} hits ${event.currentValue}! What an achievement!`;
    
    case 'prediction_won':
      return `💰 Winner! A bet on ${event.teamName} just paid out ${event.currentValue} coins!`;
    
    case 'prediction_lost':
      return `${event.teamName} bet settles. ${event.currentValue} coins return to the pool.`;
    
    default:
      return `${event.teamName} - ${event.metricType}: ${event.currentValue}. Something's happening!`;
  }
}

// Generate generic filler content
function generateGenericFiller(): FillerContent {
  const fillerTexts = [
    "The competition is heating up! Teams are neck and neck in this thrilling showdown.",
    "Our analysts predict some major moves coming up. Stay tuned!",
    "What a day of action we've seen so far! The momentum keeps shifting.",
    "This is shaping up to be one of the most competitive events yet!",
    "The odds are constantly changing - who will come out on top?",
    "Teams are strategizing their next moves. The tension is palpable!",
    "Every decision counts in this high-stakes competition.",
    "The leaderboard could change at any moment. Don't blink!"
  ];

  return {
    id: `filler-${Date.now()}`,
    type: 'fun_fact',
    text: fillerTexts[Math.floor(Math.random() * fillerTexts.length)],
    priority: 'background',
    timestamp: new Date().toISOString()
  };
}
