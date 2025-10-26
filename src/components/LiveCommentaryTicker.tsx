import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";

interface Commentary {
  id: string;
  text: string;
  voice_persona: string;
  created_at: string;
}

interface LiveCommentaryTickerProps {
  hackathonId?: string;
}

export const LiveCommentaryTicker = ({ hackathonId }: LiveCommentaryTickerProps) => {
  const [commentary, setCommentary] = useState<Commentary[]>([]);

  useEffect(() => {
    fetchCommentary();

    const channel = supabase
      .channel('commentary-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'commentary_feed'
      }, (payload) => {
        const newComment = payload.new as Commentary & { hackathon_id?: string };
        if (!hackathonId || newComment.hackathon_id === hackathonId) {
          setCommentary(prev => [payload.new as Commentary, ...prev].slice(0, 20));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId]);

  const fetchCommentary = async () => {
    let query = supabase
      .from('commentary_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    }
    
    const { data } = await query;
    
    if (data) {
      setCommentary(data);
    }
  };

  if (commentary.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4 z-50">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive rounded-full flex-shrink-0">
          <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
          <Radio className="w-3 h-3 text-destructive-foreground" />
          <span className="text-xs font-bold text-destructive-foreground">LIVE</span>
        </div>
        
        <div className="flex gap-8 animate-scroll">
          {commentary.map(item => (
            <span key={item.id} className="text-sm whitespace-nowrap">
              <span className="text-primary font-semibold">[{item.voice_persona}]</span> {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
