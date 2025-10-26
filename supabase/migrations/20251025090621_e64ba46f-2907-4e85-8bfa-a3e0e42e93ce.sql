-- Create broadcast_content table for all AI-generated content
CREATE TABLE public.broadcast_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('commentary', 'ticker', 'banner', 'breaking')),
  text TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  team_name TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('breaking', 'normal', 'background')),
  duration INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_content ENABLE ROW LEVEL SECURITY;

-- Public read access for broadcast content
CREATE POLICY "Broadcast content is viewable by everyone" 
ON public.broadcast_content 
FOR SELECT 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_broadcast_content_created_at ON public.broadcast_content(created_at DESC);
CREATE INDEX idx_broadcast_content_type ON public.broadcast_content(content_type);

-- Enable realtime
ALTER TABLE public.broadcast_content REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_content;