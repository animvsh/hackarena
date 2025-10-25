import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BroadcastContentItem {
  id: string;
  content_type: 'commentary' | 'ticker' | 'banner' | 'breaking';
  text: string;
  team_name: string;
  priority: 'breaking' | 'normal' | 'background';
  duration: number;
  created_at: string;
}

const FAKE_TEAMS = ['CodeCrusaders', 'DevDynamos', 'TechTitans', 'BugBusters', 'GitGurus', 'DataDragons', 'CloudNinjas', 'APIAvengers'];
const FAKE_METRICS = ['commits pushed', 'feature completed', 'bug fixed', 'milestone reached', 'deployment successful', 'PR merged', 'tests passed', 'refactor completed'];

export function useAIBroadcastContent() {
  const [commentary, setCommentary] = useState<BroadcastContentItem | null>(null);
  const [tickerItems, setTickerItems] = useState<BroadcastContentItem[]>([]);
  const [bannerText, setBannerText] = useState<BroadcastContentItem | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Fetch initial content
    const fetchInitialContent = async () => {
      // Get latest commentary
      const { data: commentaryData } = await supabase
        .from('broadcast_content')
        .select('*')
        .eq('content_type', 'commentary')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (commentaryData) {
        setCommentary(commentaryData as BroadcastContentItem);
      }

      // Get ticker items
      const { data: tickerData } = await supabase
        .from('broadcast_content')
        .select('*')
        .eq('content_type', 'ticker')
        .order('created_at', { ascending: false })
        .limit(10);

      if (tickerData) {
        setTickerItems(tickerData as BroadcastContentItem[]);
      }

      // Get latest banner
      const { data: bannerData } = await supabase
        .from('broadcast_content')
        .select('*')
        .eq('content_type', 'banner')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bannerData) {
        setBannerText(bannerData as BroadcastContentItem);
      }
    };

    fetchInitialContent();

    // Subscribe to new content
    const channel = supabase
      .channel('broadcast-content-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'broadcast_content',
        },
        (payload) => {
          const newItem = payload.new as BroadcastContentItem;
          
          console.log('New broadcast content:', newItem);

          if (newItem.content_type === 'commentary') {
            setCommentary(newItem);
          } else if (newItem.content_type === 'ticker') {
            setTickerItems((prev) => [newItem, ...prev].slice(0, 20));
          } else if (newItem.content_type === 'banner') {
            setBannerText(newItem);
          }
        }
      )
      .subscribe();

    // Auto-generate fake content every 12 seconds
    const contentTypes: Array<'commentary' | 'ticker' | 'banner' | 'breaking'> = ['commentary', 'ticker', 'banner', 'commentary', 'ticker', 'breaking'];
    let contentIndex = 0;

    const generateFakeContent = async () => {
      const team = FAKE_TEAMS[Math.floor(Math.random() * FAKE_TEAMS.length)];
      const metric = FAKE_METRICS[Math.floor(Math.random() * FAKE_METRICS.length)];
      const value = Math.floor(Math.random() * 100) + 1;
      const change = Math.floor(Math.random() * 40) - 10;
      const contentType = contentTypes[contentIndex % contentTypes.length];
      
      contentIndex++;

      console.log('Auto-generating broadcast content:', { team, metric, value, change, contentType });

      try {
        await supabase.functions.invoke('generate-broadcast-content', {
          body: {
            teamName: team,
            metricType: metric,
            currentValue: value,
            change,
            contentType
          },
        });
      } catch (error) {
        console.error('Failed to auto-generate content:', error);
      }
    };

    // Generate initial content immediately
    generateFakeContent();

    // Then generate every 7 seconds for faster updates
    const interval = setInterval(generateFakeContent, 7000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const generateContent = async (
    teamName: string,
    metricType: string,
    currentValue: number,
    change: number,
    contentType: 'commentary' | 'ticker' | 'banner' | 'breaking' = 'commentary'
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-broadcast-content', {
        body: {
          teamName,
          metricType,
          currentValue,
          change,
          contentType
        },
      });

      if (error) {
        console.error('Error generating content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to generate content:', error);
      return null;
    }
  };

  return {
    commentary,
    tickerItems,
    bannerText,
    isLive,
    generateContent
  };
}
