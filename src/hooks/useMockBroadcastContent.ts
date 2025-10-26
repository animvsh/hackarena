import { useState, useEffect } from 'react';
import type { BroadcastContentItem } from '@/types/broadcastEvent';

const MOCK_TEAMS = ['Team Alpha', 'Team Beta', 'Code Warriors', 'Bug Hunters', 'Pixel Pirates', 'Syntax Squad'];
const MOCK_METRICS = ['completion rate', 'code quality', 'innovation score', 'user testing', 'deployment status'];
const MOCK_EVENTS = [
  'just submitted their latest build',
  'achieved a major milestone',
  'completed user testing phase',
  'deployed to production',
  'won the design challenge',
  'merged a critical pull request',
  'fixed 15 bugs in record time',
  'impressed the judges',
];

export function useMockBroadcastContent() {
  const [commentary, setCommentary] = useState<BroadcastContentItem | null>(null);
  const [tickerItems, setTickerItems] = useState<BroadcastContentItem[]>([]);
  const [bannerText, setBannerText] = useState<BroadcastContentItem | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Generate random commentary every 8 seconds
  useEffect(() => {
    const generateCommentary = () => {
      const team = MOCK_TEAMS[Math.floor(Math.random() * MOCK_TEAMS.length)];
      const event = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      const metric = MOCK_METRICS[Math.floor(Math.random() * MOCK_METRICS.length)];
      const value = Math.floor(Math.random() * 100);
      
      const narratives = [
        `Breaking news from the hackathon floor! ${team} ${event}. Their ${metric} is now at ${value}%.`,
        `We're seeing incredible progress from ${team}. They've just ${event}, pushing their ${metric} to an impressive ${value}%.`,
        `This is exciting! ${team} continues to dominate with their latest achievement. They ${event}, and their ${metric} stands at ${value}%.`,
        `Live update: ${team} ${event}! The judges are taking notice as their ${metric} reaches ${value}%.`,
        `Remarkable! ${team} ${event}. This brings their ${metric} up to ${value}%, putting them in strong contention.`,
      ];

      const text = narratives[Math.floor(Math.random() * narratives.length)];
      const priority = Math.random() > 0.7 ? 'breaking' : 'normal';

      setCommentary({
        id: `commentary-${Date.now()}`,
        content_type: 'commentary',
        text,
        team_name: team,
        priority: priority as 'breaking' | 'normal',
        duration: 8000,
        created_at: new Date().toISOString(),
      });
    };

    // Initial commentary
    generateCommentary();

    // Generate new commentary every 8-12 seconds
    const interval = setInterval(() => {
      generateCommentary();
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  // Generate ticker items every 5 seconds
  useEffect(() => {
    const generateTicker = () => {
      const team = MOCK_TEAMS[Math.floor(Math.random() * MOCK_TEAMS.length)];
      const events = [
        `${team} commits new feature`,
        `${team} passes all tests`,
        `${team} up ${Math.floor(Math.random() * 20)}% in polls`,
        `Betting odds shift for ${team}`,
        `${team} wins community vote`,
        `New prediction: ${team} favorite to win`,
      ];

      const newTicker: BroadcastContentItem = {
        id: `ticker-${Date.now()}`,
        content_type: 'ticker',
        text: events[Math.floor(Math.random() * events.length)],
        team_name: team,
        priority: Math.random() > 0.85 ? 'breaking' : 'normal',
        duration: 5000,
        created_at: new Date().toISOString(),
      };

      setTickerItems(prev => [...prev.slice(-10), newTicker]); // Keep last 10
    };

    // Initial tickers
    for (let i = 0; i < 5; i++) {
      setTimeout(() => generateTicker(), i * 1000);
    }

    const interval = setInterval(generateTicker, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate banner every 12 seconds
  useEffect(() => {
    const generateBanner = () => {
      const team = MOCK_TEAMS[Math.floor(Math.random() * MOCK_TEAMS.length)];
      const metric = MOCK_METRICS[Math.floor(Math.random() * MOCK_METRICS.length)];
      const banners = [
        `${team} - ${metric}: ${Math.floor(Math.random() * 100)}%`,
        `LIVE: ${team} making progress`,
        `${team} leads in ${metric}`,
        `Update: ${team} innovation score rising`,
      ];

      const priority = Math.random() > 0.9 ? 'breaking' : 'normal';

      setBannerText({
        id: `banner-${Date.now()}`,
        content_type: 'banner',
        text: banners[Math.floor(Math.random() * banners.length)],
        team_name: team,
        priority: priority as 'breaking' | 'normal',
        duration: 6000,
        created_at: new Date().toISOString(),
      });

      // Clear banner after duration
      setTimeout(() => setBannerText(null), 6000);
    };

    const interval = setInterval(generateBanner, 12000);
    return () => clearInterval(interval);
  }, []);

  return {
    commentary,
    tickerItems,
    bannerText,
    isLive,
  };
}
