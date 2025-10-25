import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  username: string;
  onUploadComplete?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

export function AvatarUpload({ 
  currentAvatarUrl, 
  userId, 
  username, 
  onUploadComplete,
  size = 'xl' 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Profile picture updated');
      onUploadComplete?.(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="relative group">
      <Avatar className={cn(sizeClasses[size], "cursor-pointer")}>
        <AvatarImage src={displayUrl || undefined} alt={username} />
        <AvatarFallback className="text-2xl">
          {username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          size === 'sm' && "h-6 w-6",
          size === 'md' && "h-8 w-8",
          (size === 'lg' || size === 'xl') && "h-10 w-10"
        )}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
