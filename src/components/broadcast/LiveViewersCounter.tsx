import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveViewersCounter() {
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 200) + 100);
  const [previousViewers, setPreviousViewers] = useState(viewers);

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousViewers(viewers);
      // Simulate viewer fluctuation
      const change = Math.floor(Math.random() * 20) - 8;
      setViewers((prev) => Math.max(50, Math.min(500, prev + change)));
    }, 10000);

    return () => clearInterval(interval);
  }, [viewers]);

  const isIncreasing = viewers > previousViewers;

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neon-blue/20">
      <Eye className="w-4 h-4 text-neon-blue" />
      <div className="flex items-center gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={viewers}
            initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
            className="text-sm font-bold text-neon-blue tabular-nums"
          >
            {viewers.toLocaleString()}
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
