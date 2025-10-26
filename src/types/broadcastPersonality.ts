export type VoiceStyle = 'formal' | 'casual' | 'analytical' | 'energetic' | 'expert';
export type AnchorPosition = 'left' | 'right' | 'center' | 'full';

export interface BroadcastPersonality {
  id: string;
  name: string;
  title: string;
  voiceStyle: VoiceStyle;
  position: AnchorPosition;
  avatar: string;
  specialties: string[];
  primaryColor: string;
  accentColor: string;
  elevenLabsVoiceId: string;
  voiceDescription: string;
}

export const BROADCAST_PERSONALITIES: BroadcastPersonality[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'Lead Anchor',
    voiceStyle: 'formal',
    position: 'left',
    avatar: '/src/assets/news-anchor-left.png',
    specialties: ['breaking-news', 'market-analysis', 'team-updates'],
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.5)',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    voiceDescription: 'Professional, clear, authoritative female voice'
  },
  {
    id: 'marcus',
    name: 'Marcus Reid',
    title: 'Senior Reporter',
    voiceStyle: 'casual',
    position: 'right',
    avatar: '/src/assets/news-anchor-right.png',
    specialties: ['field-reports', 'interviews', 'analysis'],
    primaryColor: 'hsl(var(--accent))',
    accentColor: 'hsl(var(--accent) / 0.5)',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceDescription: 'Warm, engaging, conversational tone'
  },
  {
    id: 'aisha',
    name: 'Dr. Aisha Patel',
    title: 'Tech Analyst',
    voiceStyle: 'analytical',
    position: 'center',
    avatar: '/src/assets/broadcast-host.jpg',
    specialties: ['tech-deep-dive', 'stats-breakdown', 'predictions'],
    primaryColor: 'hsl(220, 80%, 60%)',
    accentColor: 'hsl(220, 80%, 70%)',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
    voiceDescription: 'Deep, analytical, expert tone'
  },
  {
    id: 'jake',
    name: 'Jake Morrison',
    title: 'Sports Commentator',
    voiceStyle: 'energetic',
    position: 'full',
    avatar: '/src/assets/broadcast-host.jpg',
    specialties: ['highlights', 'play-by-play', 'excitement'],
    primaryColor: 'hsl(30, 95%, 55%)',
    accentColor: 'hsl(30, 95%, 65%)',
    elevenLabsVoiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    voiceDescription: 'High energy, enthusiastic, fast-paced'
  },
  {
    id: 'lisa',
    name: 'Lisa Rodriguez',
    title: 'Field Reporter',
    voiceStyle: 'energetic',
    position: 'full',
    avatar: '/src/assets/broadcast-host.jpg',
    specialties: ['on-location', 'team-interviews', 'live-action'],
    primaryColor: 'hsl(350, 85%, 60%)',
    accentColor: 'hsl(350, 85%, 70%)',
    elevenLabsVoiceId: 'pFZP5JQG7iQjIQuC4Bku',
    voiceDescription: 'Bright, energetic, on-the-scene reporter'
  },
  {
    id: 'chen-wei',
    name: 'Professor Chen Wei',
    title: 'Expert Analyst',
    voiceStyle: 'expert',
    position: 'center',
    avatar: '/src/assets/broadcast-host.jpg',
    specialties: ['expert-commentary', 'historical-context', 'strategy'],
    primaryColor: 'hsl(280, 70%, 60%)',
    accentColor: 'hsl(280, 70%, 70%)',
    elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9',
    voiceDescription: 'Mature, wise, authoritative professor tone'
  },
];

export function selectPersonalityForScene(scene: string): BroadcastPersonality[] {
  switch (scene) {
    case 'anchor':
      return [BROADCAST_PERSONALITIES[0], BROADCAST_PERSONALITIES[1]]; // Sarah + Marcus
    case 'market':
      return [BROADCAST_PERSONALITIES[2]]; // Dr. Aisha
    case 'highlight':
      return [BROADCAST_PERSONALITIES[3]]; // Jake
    case 'stats':
      return [BROADCAST_PERSONALITIES[5]]; // Professor Chen
    case 'team':
      return [BROADCAST_PERSONALITIES[0]]; // Sarah
    default:
      return [BROADCAST_PERSONALITIES[0]];
  }
}
