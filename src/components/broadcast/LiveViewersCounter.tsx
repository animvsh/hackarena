import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalBroadcastState } from '@/hooks/useGlobalBroadcastState';

export function LiveViewersCounter() {
  const { liveViewerCount } = useGlobalBroadcastState();
  const [previousViewers, setPreviousViewers] = useState(liveViewerCount);

  useEffect(() => {
    setPreviousViewers((prev) => {
      // Only update previous if viewer count actually changed
      if (prev !== liveViewerCount) {
        return prev;
      }
      return liveViewerCount;
    });
  }, [liveViewerCount]);

  const isIncreasing = liveViewerCount > previousViewers;

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neon-blue/20">
      <Eye className="w-4 h-4 text-neon-blue" />
      <div className="flex items-center gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={liveViewerCount}
            initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
            className="text-sm font-bold text-neon-blue tabular-nums"
          >
            {liveViewerCount.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-muted-foreground">watching</span>
      </div>
      <motion.div
        className="w-2 h-2 bg-neon-blue rounded-full"
        animate={{
          opacity: [1, 0.3, 1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </div>
  );
}
