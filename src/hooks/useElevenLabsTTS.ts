import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseElevenLabsTTSProps {
  text: string;
  voiceId?: string;
  isMuted: boolean;
  enabled?: boolean;
  isPaused?: boolean;
}

export function useElevenLabsTTS({ text, voiceId = 'EXAVITQu4vr4xnSDxMaL', isMuted, enabled = true, isPaused = false }: UseElevenLabsTTSProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string>('');
  const textToSpeakRef = useRef<string>('');
  const isGeneratingRef = useRef(false);
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

    // Only stop existing audio if we're starting new speech
    // Don't interrupt if same text
    if (audioRef.current && currentTextRef.current !== textToSpeak) {
      stopAudio();
    }

    // Skip if already playing this exact text
    if (currentTextRef.current === textToSpeak && audioRef.current && !audioRef.current.paused) {
      console.log('[TTS] Already playing this text, skipping');
      return;
    }

    currentTextRef.current = textToSpeak;
    setIsLoading(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      // Call Supabase Edge Function instead of ElevenLabs directly
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://jqdfjcpgevgajdljckur.supabase.co/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGZqY3BnZXZnYWpkbGpja3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTgzNjYsImV4cCI6MjA3NjU3NDM2Nn0.dt7VTK39V6mk18S5p3HYzEBlXSqktINOEoibV2nfjfg'}`,
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
        audioRef.current.src = '';
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.8;
      
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsLoading(false);
        currentTextRef.current = '';  // Reset after completion
      };

      audioRef.current.onerror = (e) => {
        console.error('[TTS] Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        setError('Failed to play audio');
        setIsLoading(false);
        currentTextRef.current = '';
      };

      await audioRef.current.play();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[TTS] Request aborted');
      } else {
        console.error('[TTS] Error:', err);
        setError(err.message || 'Failed to generate speech');
      }
      setIsLoading(false);
      currentTextRef.current = '';
    }
  }, [voiceId, stopAudio]);

  // Effect to handle pause state
  useEffect(() => {
    if (isPaused && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    } else if (!isPaused && audioRef.current && audioRef.current.paused && !isMuted) {
      audioRef.current.play().catch(err => {
        console.error('Error resuming audio:', err);
      });
    }
  }, [isPaused, isMuted]);

  // DISABLED: TTS temporarily disabled due to quota exceeded error
  useEffect(() => {
    // Disable all TTS functionality
    setError('TTS temporarily disabled - ElevenLabs quota exceeded');
    console.log('[useElevenLabsTTS] TTS DISABLED - quota exceeded');
    return;
  }, []);

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

