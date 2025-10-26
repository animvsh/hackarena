-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS policy for avatar uploads
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for avatar updates
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for avatar deletes
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for public avatar viewing
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Create profile views tracking table
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT
);

-- Index for performance
CREATE INDEX idx_profile_views_profile_user ON profile_views(profile_user_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile views
CREATE POLICY "Users can view their own profile views"
ON profile_views FOR SELECT
USING (profile_user_id = auth.uid());

-- Anyone can insert profile views
CREATE POLICY "Anyone can track profile views"
ON profile_views FOR INSERT
WITH CHECK (true);