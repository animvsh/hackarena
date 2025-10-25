import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FillerContent } from '@/types/broadcastEvent';

interface MemberData {
  id: string;
  name: string;
  team_name: string;
  role?: string;
  github_username?: string;
}

export function useMemberSpotlight() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedMembers, setUsedMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select(`
          id,
          name,
          role,
          github_username,
          team_id,
          teams!inner(name)
        `)
        .limit(50);

      if (data) {
        const formattedMembers = data.map(m => ({
          id: m.id,
          name: m.name,
          team_name: (m as any).teams?.name || 'Unknown Team',
          role: m.role,
          github_username: m.github_username
        }));
        setMembers(formattedMembers);
      }
    };

    fetchMembers();
  }, []);

  const generateSpotlight = useCallback(async (): Promise<FillerContent | null> => {
    if (members.length === 0) return null;

    // Reset if we've used all members
    if (usedMembers.size >= members.length) {
      setUsedMembers(new Set());
    }

    // Find next unused member
    let member = members[currentIndex];
    let attempts = 0;
    while (usedMembers.has(member.id) && attempts < members.length) {
      setCurrentIndex(prev => (prev + 1) % members.length);
      member = members[(currentIndex + attempts) % members.length];
      attempts++;
    }

    setUsedMembers(prev => new Set([...prev, member.id]));
    setCurrentIndex(prev => (prev + 1) % members.length);

    const spotlightTexts = [
      `Let's spotlight ${member.name} from ${member.team_name}! ${member.role ? `As ${member.role}, they're` : `They're`} making waves in the competition.`,
      `${member.name} is a key player for ${member.team_name}. ${member.github_username ? `Follow their work @${member.github_username}!` : `Watch this space for their next move!`}`,
      `Shoutout to ${member.name} from ${member.team_name}! Their contributions have been instrumental to the team's success.`,
      `Meet ${member.name}, representing ${member.team_name} with excellence. ${member.role ? `Their ${member.role} skills are` : `They're`} top-notch!`,
      `${member.team_name}'s ${member.name} is one to watch! Their dedication and skill continue to impress our analysts.`
    ];

    const randomText = spotlightTexts[Math.floor(Math.random() * spotlightTexts.length)];

    return {
      id: `spotlight-${member.id}-${Date.now()}`,
      type: 'member_spotlight',
      text: randomText,
      teamName: member.team_name,
      priority: 'background',
      timestamp: new Date().toISOString()
    };
  }, [members, currentIndex, usedMembers]);

  return { generateSpotlight };
}
