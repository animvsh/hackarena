import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBroadcastPause } from '@/contexts/BroadcastPauseContext';

interface GenerateNarrativeParams {
  teamName: string;
  metricType: string;
  currentValue: number;
  change: number;
}

interface NarrativeResponse {
  narrative: string;
  duration: number;
  priority: 'breaking' | 'normal' | 'background';
}

export function useBroadcastNarrative() {
  const { isPaused } = useBroadcastPause();
  const [narrative, setNarrative] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNarrative = async (params: GenerateNarrativeParams): Promise<NarrativeResponse | null> => {
    if (isPaused) {
      console.log('[useBroadcastNarrative] Skipping narrative generation - broadcast paused');
      return null;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-broadcast-commentary', {
        body: params,
      });

      if (error) throw error;

      setNarrative(data.narrative);
      return data;
    } catch (error) {
      console.error('Failed to generate narrative:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { narrative, generateNarrative, isGenerating };
}
