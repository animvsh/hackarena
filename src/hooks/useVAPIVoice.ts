import { useState } from 'react';

export function useVAPIVoice() {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string) => {
    // TODO: User implements VAPI integration here
    // Simulate speaking
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  return { 
    speak, 
    isReady, 
    isSpeaking,
    // User will add VAPI initialization here
  };
}
