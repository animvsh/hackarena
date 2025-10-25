import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BroadcastScene } from '@/types/broadcast';

export interface AICommentaryPiece {
  text: string;
  duration: number;
  personality: 'left' | 'right';
  priority: 'breaking' | 'normal' | 'background';
}

export interface AISegmentContent {
  title: string;
  bannerText: string;
  commentary: AICommentaryPiece[];
  tickerItems: { text: string; duration: number }[];
  totalDuration: number;
}

export function useAISegmentContent() {
  const generateAICommentary = useCallback(async (
    scene: BroadcastScene,
    teamName?: string,
    metricType?: string,
    currentValue?: number
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-broadcast-commentary', {
        body: {
          teamName: teamName || 'Team Alpha',
          metricType: metricType || getMetricForScene(scene),
          currentValue: currentValue || Math.floor(Math.random() * 100),
          change: Math.floor(Math.random() * 20) - 10
        }
      });

      if (error) throw error;
      return data.narrative || getFallbackCommentary(scene);
    } catch (error) {
      console.error('AI commentary generation failed:', error);
      return getFallbackCommentary(scene);
    }
  }, []);

  const generateSegmentWithAI = useCallback(async (scene: BroadcastScene): Promise<AISegmentContent> => {
    // Generate multiple commentary pieces for the segment
    const commentaryPromises = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(async (_, index) => {
      const text = await generateAICommentary(scene);
      const wordCount = text.split(' ').length;
      const duration = Math.max(4, Math.ceil((wordCount / 2.5))); // ~150 words/min
      
      return {
        text,
        duration,
        personality: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        priority: (Math.random() > 0.8 ? 'breaking' : 'normal') as 'breaking' | 'normal' | 'background'
      };
    });

    const commentary = await Promise.all(commentaryPromises);
    const totalDuration = commentary.reduce((sum, piece) => sum + piece.duration, 0);

    // Generate ticker items
    const tickerItems = await generateTickerItems(scene);

    return {
      title: getSceneTitle(scene),
      bannerText: getBannerText(scene),
      commentary,
      tickerItems,
      totalDuration
    };
  }, [generateAICommentary]);

  return { generateSegmentWithAI, generateAICommentary };
}

function getSceneTitle(scene: BroadcastScene): string {
  const titles = {
    anchor: 'HACKCAST LIVE',
    team: 'TEAM SPOTLIGHT',
    market: 'MARKET WATCH',
    stats: 'PERFORMANCE STATS',
    highlight: 'TOP HIGHLIGHTS'
  };
  return titles[scene];
}

function getBannerText(scene: BroadcastScene): string {
  const banners = {
    anchor: 'Breaking news from the hackathon floor',
    team: 'Team performance deep dive',
    market: 'Live market odds and predictions',
    stats: 'Real-time analytics dashboard',
    highlight: 'Best moments from the competition'
  };
  return banners[scene];
}

function getMetricForScene(scene: BroadcastScene): string {
  const metrics = {
    anchor: 'Overall Performance',
    team: 'Team Progress',
    market: 'Market Odds',
    stats: 'Commit Activity',
    highlight: 'Momentum Score'
  };
  return metrics[scene];
}

async function generateTickerItems(scene: BroadcastScene): Promise<{ text: string; duration: number }[]> {
  // Fetch recent activity from database
  try {
    const { data, error } = await supabase
      .from('broadcast_content')
      .select('text')
      .eq('content_type', 'ticker')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        text: item.text,
        duration: 5
      }));
    }
  } catch (error) {
    console.error('Failed to fetch ticker items:', error);
  }

  // Fallback ticker items
  const fallbackTickers = [
    `${getSceneTitle(scene)} • Live updates from the competition`,
    'Team momentum scores updating in real-time',
    'Market predictions shifting as teams advance',
    'Breaking: New commits detected across multiple teams',
    'Viewers worldwide watching the action unfold'
  ];

  return fallbackTickers.map(text => ({ text, duration: 5 }));
}

function getFallbackCommentary(scene: BroadcastScene): string {
  const fallbacks = {
    anchor: "Welcome back to HACKCAST LIVE! We're tracking all the action from the hackathon floor. Teams are making incredible progress, and the competition is heating up!",
    team: "Let's dive into our featured team spotlight! They've been showing remarkable momentum with consistent commits and innovative solutions. Their strategy is paying off!",
    market: "The prediction markets are buzzing with activity! Odds are shifting as teams demonstrate their capabilities. Bettors are watching every move closely!",
    stats: "Looking at the numbers, we're seeing impressive statistics across the board! Commit activity is surging, and teams are executing their strategies with precision!",
    highlight: "What an incredible series of moments we've witnessed! From breakthrough commits to strategic pivots, these teams are delivering excellence at every turn!"
  };
  return fallbacks[scene];
}
