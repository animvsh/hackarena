import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseElevenLabsTTSProps {
  text: string;
  voiceId?: string;
  isMuted: boolean;
  enabled?: boolean;
}

export function useElevenLabsTTS({ text, voiceId = 'EXAVITQu4vr4xnSDxMaL', isMuted, enabled = true }: UseElevenLabsTTSProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const generateSpeech = useCallback(async (textToSpeak: string) => {
    if (!textToSpeak || textToSpeak.trim().length === 0) {
      return;
    }

    // Stop any existing audio
    stopAudio();

    setIsLoading(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      // Call Supabase Edge Function instead of ElevenLabs directly
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            text: textToSpeak,
            voiceId: voiceId,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.8;
      
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsLoading(false);
      };

      audioRef.current.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setError('Failed to play audio');
        setIsLoading(false);
      };

      await audioRef.current.play();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was aborted, this is expected
        console.log('TTS request aborted');
      } else {
        console.error('TTS error:', err);
        setError(err.message || 'Failed to generate speech');
      }
      setIsLoading(false);
    }
  }, [voiceId, stopAudio]);

  // Effect to handle text changes
  useEffect(() => {
    // Only generate speech if:
    // 1. Not muted
    // 2. Enabled
    // 3. Text has changed
    // 4. Text is not empty
    if (!isMuted && enabled && text && text !== currentTextRef.current) {
      currentTextRef.current = text;
      generateSpeech(text);
    } else if (isMuted) {
      // Stop audio if muted
      stopAudio();
    }

    return () => {
      // Cleanup on unmount or when text changes
      if (text !== currentTextRef.current) {
        stopAudio();
      }
    };
  }, [text, isMuted, enabled, generateSpeech, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isLoading,
    error,
    stopAudio,
  };
}

