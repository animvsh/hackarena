import { useMemo } from 'react';
import type { BroadcastScene } from '@/types/broadcast';

export interface SegmentCommentary {
  id: string;
  text: string;
  duration: number; // in seconds
  personality: 'left' | 'right';
  priority: 'breaking' | 'normal' | 'background';
}

export interface SegmentContent {
  scene: BroadcastScene;
  title: string;
  subtitle: string;
  commentary: SegmentCommentary[];
  totalDuration: number;
  bannerText?: string;
  tickerItems: Array<{ text: string; type: 'stat' | 'market' | 'achievement' }>;
}

const TEAMS = ['HackSquad Alpha', 'CodeCrafters', 'DevDynamos', 'ByteBuilders', 'PixelPioneers'];
const SPONSORS = ['TechCorp', 'CloudBase', 'DataFlow', 'APIHub', 'DevTools Inc'];

export function useSegmentContent() {
  const generateAnchorSegment = (): SegmentContent => {
    return {
      scene: 'anchor',
      title: 'HACKCAST LIVE',
      subtitle: 'Breaking News & Updates',
      commentary: [
        {
          id: 'anchor-1',
          text: "Welcome back to HackCast Live! We're tracking some major developments across all hackathon teams.",
          duration: 6,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'anchor-2',
          text: "The competition is heating up as we enter the final hours. Market volatility is at an all-time high with massive shifts in team valuations.",
          duration: 8,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'anchor-3',
          text: "We've got exclusive coverage coming up on the top performing teams, market trends, and statistical breakdowns. Stay tuned!",
          duration: 7,
          personality: 'left',
          priority: 'normal'
        }
      ],
      totalDuration: 21,
      tickerItems: [
        { text: '🔴 LIVE: Hackathon markets showing high volatility', type: 'market' },
        { text: '📊 Trading volume up 340% in last hour', type: 'stat' },
        { text: '⚡ Multiple teams hitting major milestones', type: 'achievement' }
      ]
    };
  };

  const generateTeamSegment = (): SegmentContent => {
    const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    const momentum = (Math.random() * 40 + 60).toFixed(1);
    const growth = (Math.random() * 50 + 10).toFixed(0);
    const commits = Math.floor(Math.random() * 100 + 50);
    
    return {
      scene: 'team',
      title: 'TEAM SPOTLIGHT',
      subtitle: `In-Depth Analysis: ${team}`,
      commentary: [
        {
          id: 'team-1',
          text: `Let's turn our attention to ${team}, one of the most exciting teams in this hackathon.`,
          duration: 5,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'team-2',
          text: `${team} has been making waves with their impressive progress. They've pushed ${commits} commits in the last 6 hours alone - that's serious momentum.`,
          duration: 9,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'team-3',
          text: `Looking at their metrics, we're seeing a momentum score of ${momentum} and ${growth}% growth trajectory. Their technical execution is exceptional.`,
          duration: 10,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'team-4',
          text: `From a betting perspective, smart money is paying close attention. Their odds have improved significantly, and we're seeing heavy volume on their markets.`,
          duration: 10,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'team-5',
          text: `We'll continue tracking ${team}'s progress. This is definitely a team to watch as we head into the final stretch.`,
          duration: 6,
          personality: 'left',
          priority: 'normal'
        }
      ],
      totalDuration: 40,
      bannerText: `${team} • Momentum Score: ${momentum}`,
      tickerItems: [
        { text: `${team} pushes ${commits} commits in 6 hours`, type: 'achievement' },
        { text: `Team momentum at ${momentum}/100`, type: 'stat' },
        { text: `${team} odds improve by ${growth}%`, type: 'market' },
        { text: `Heavy trading volume on ${team} markets`, type: 'market' }
      ]
    };
  };

  const generateMarketSegment = (): SegmentContent => {
    const topTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    const volume = (Math.random() * 500 + 200).toFixed(0);
    const shift = (Math.random() * 30 + 10).toFixed(1);
    
    return {
      scene: 'market',
      title: 'MARKET WATCH',
      subtitle: 'Betting Trends & Analysis',
      commentary: [
        {
          id: 'market-1',
          text: "Now let's dive into the betting markets and see where the action is.",
          duration: 5,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'market-2',
          text: `The biggest movers right now - ${topTeam} seeing a ${shift}% odds shift in the last hour. That's significant movement that tells us something is happening.`,
          duration: 10,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'market-3',
          text: `Volume analysis shows ${volume}K tokens traded across all markets today. We're seeing particularly heavy action on the top 3 teams, with smart money positioning for the final hours.`,
          duration: 12,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'market-4',
          text: "What's interesting is the insider perspective - teams with strong GitHub activity are getting attention from experienced bettors who know what metrics matter.",
          duration: 10,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'market-5',
          text: "Keep watching these markets closely. We'll have more updates as the odds continue to shift.",
          duration: 5,
          personality: 'right',
          priority: 'normal'
        }
      ],
      totalDuration: 42,
      bannerText: `Market Volume: ${volume}K tokens traded`,
      tickerItems: [
        { text: `${topTeam} odds shift ${shift}% in last hour`, type: 'market' },
        { text: `Total market volume: ${volume}K tokens`, type: 'market' },
        { text: 'Smart money positioning on top 3 teams', type: 'market' },
        { text: 'High volatility expected in final hours', type: 'market' }
      ]
    };
  };

  const generateStatsSegment = (): SegmentContent => {
    const leader = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    const score = (Math.random() * 20 + 80).toFixed(1);
    
    return {
      scene: 'stats',
      title: 'STATS BREAKDOWN',
      subtitle: 'Performance Metrics Deep Dive',
      commentary: [
        {
          id: 'stats-1',
          text: "Time for our comprehensive stats breakdown. Let's look at the numbers that really matter.",
          duration: 5,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'stats-2',
          text: `Current standings show ${leader} at the top with an impressive ${score} overall rating. But the competition is incredibly tight - just 5 points separate the top five teams.`,
          duration: 11,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'stats-3',
          text: "We're analyzing momentum trends, and there's a clear pattern emerging. Teams with consistent commit velocity over the past 12 hours are outperforming those with sporadic activity.",
          duration: 12,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'stats-4',
          text: "Looking at projections - if current trends continue, we could see a major shakeup in the final rankings. The data suggests at least two teams are positioned for dramatic climbs.",
          duration: 10,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'stats-5',
          text: "More statistical analysis coming your way throughout the broadcast. These numbers tell the story.",
          duration: 5,
          personality: 'left',
          priority: 'normal'
        }
      ],
      totalDuration: 43,
      bannerText: `${leader} leads with ${score}/100 rating`,
      tickerItems: [
        { text: `${leader} tops leaderboard at ${score}/100`, type: 'stat' },
        { text: 'Top 5 teams within 5 points of each other', type: 'stat' },
        { text: 'Commit velocity strongly correlates with rankings', type: 'stat' },
        { text: 'Two teams positioned for dramatic climbs', type: 'stat' }
      ]
    };
  };

  const generateHighlightSegment = (): SegmentContent => {
    const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    const achievement = ['deployed to production', 'completed major feature', 'integrated AI functionality', 'achieved perfect demo'][Math.floor(Math.random() * 4)];
    
    return {
      scene: 'highlight',
      title: 'HIGHLIGHT REEL',
      subtitle: 'Major Events & Achievements',
      commentary: [
        {
          id: 'highlight-1',
          text: "We have some incredible highlights to share from today's competition. These are the moments that define this hackathon.",
          duration: 6,
          personality: 'right',
          priority: 'breaking'
        },
        {
          id: 'highlight-2',
          text: `Breaking: ${team} just ${achievement}! This is a game-changing moment that could significantly impact their final score.`,
          duration: 8,
          personality: 'left',
          priority: 'breaking'
        },
        {
          id: 'highlight-3',
          text: "We've witnessed some remarkable technical achievements today - teams are pushing the boundaries of what's possible in a 48-hour sprint.",
          duration: 9,
          personality: 'right',
          priority: 'normal'
        },
        {
          id: 'highlight-4',
          text: "The level of innovation we're seeing is extraordinary. From AI integrations to real-time collaboration tools, these teams are building the future.",
          duration: 10,
          personality: 'left',
          priority: 'normal'
        },
        {
          id: 'highlight-5',
          text: "Stay tuned for more highlights as they happen. This is HackCast Live, bringing you every major moment.",
          duration: 6,
          personality: 'right',
          priority: 'normal'
        }
      ],
      totalDuration: 39,
      bannerText: `🔴 BREAKING: ${team} ${achievement}!`,
      tickerItems: [
        { text: `🏆 ${team} ${achievement}`, type: 'achievement' },
        { text: '⚡ Multiple teams hitting major milestones', type: 'achievement' },
        { text: '🚀 Innovation levels at all-time high', type: 'achievement' },
        { text: '💡 AI integrations becoming standard', type: 'achievement' }
      ]
    };
  };

  const segmentGenerators = useMemo(() => ({
    anchor: generateAnchorSegment,
    team: generateTeamSegment,
    market: generateMarketSegment,
    stats: generateStatsSegment,
    highlight: generateHighlightSegment
  }), []);

  return {
    generateSegment: (scene: BroadcastScene): SegmentContent => {
      return segmentGenerators[scene]();
    }
  };
}
