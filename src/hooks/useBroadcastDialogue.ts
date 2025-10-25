import { useState, useEffect } from 'react';

interface DialogueItem {
  id: string;
  text: string;
  anchor: 'left' | 'right';
  timestamp: string;
}

export function useBroadcastDialogue(narratives: Array<{ id: string; text: string; timestamp: string }>) {
  const [currentDialogue, setCurrentDialogue] = useState<DialogueItem | null>(null);
  const [dialogueQueue, setDialogueQueue] = useState<DialogueItem[]>([]);
  const [lastAnchor, setLastAnchor] = useState<'left' | 'right'>('right');

  // Convert narratives to dialogue items with alternating anchors
  useEffect(() => {
    if (narratives.length === 0) return;

    const newDialogues: DialogueItem[] = narratives.map((narrative, index) => {
      // Alternate between left and right anchor
      const anchor = index % 2 === 0 ? 'left' : 'right';
      
      return {
        id: narrative.id,
        text: narrative.text,
        anchor,
        timestamp: narrative.timestamp,
      };
    });

    setDialogueQueue(newDialogues);
  }, [narratives]);

  // Process dialogue queue
  useEffect(() => {
    if (dialogueQueue.length === 0) return;
    if (currentDialogue) return; // Wait for current dialogue to finish

    const nextDialogue = dialogueQueue[0];
    setCurrentDialogue(nextDialogue);
    setLastAnchor(nextDialogue.anchor);

    // Calculate duration based on text length (roughly 50ms per character + 2s buffer)
    const duration = Math.max(nextDialogue.text.length * 50, 3000);

    const timer = setTimeout(() => {
      setCurrentDialogue(null);
      setDialogueQueue(prev => prev.slice(1));
    }, duration);

    return () => clearTimeout(timer);
  }, [dialogueQueue, currentDialogue]);

  return {
    currentDialogue,
    hasMoreDialogue: dialogueQueue.length > 0,
  };
}
