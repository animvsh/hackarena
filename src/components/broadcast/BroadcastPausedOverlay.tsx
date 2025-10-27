import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BroadcastPausedOverlayProps {
  pausedAt?: string | null;
  isPausedBySystem?: boolean;
}

export function BroadcastPausedOverlay({ pausedAt, isPausedBySystem }: BroadcastPausedOverlayProps) {
  const [pauseDuration, setPauseDuration] = useState(0);

  useEffect(() => {
    if (!pausedAt) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(pausedAt).getTime();
      setPauseDuration(Math.floor(elapsed / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [pausedAt]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[300] bg-gradient-to-br from-black/90 via-slate-900/95 to-black/90 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="text-center space-y-6 px-8">
        {/* Pulsing Pause Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <div className="p-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-4 border-red-500/50">
            <Pause className="w-20 h-20 text-red-500" fill="currentColor" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            {isPausedBySystem ? 'BROADCAST PAUSED' : 'BROADCAST PAUSED'}
          </h1>
          <p className="text-xl text-white/70">
            {isPausedBySystem 
              ? 'No active viewers • Broadcast will resume when someone joins'
              : 'Waiting for master user to resume...'}
          </p>
        </motion.div>

        {/* Animated Waiting Indicator */}
        <motion.div
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center gap-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
          ))}
        </motion.div>

        {/* Pause duration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-white/80 mt-4"
        >
          Paused for {Math.floor(pauseDuration / 60)}:{(pauseDuration % 60).toString().padStart(2, '0')}
        </motion.p>

        {/* Status indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Timers</p>
            <p className="text-sm text-red-400 font-bold">⏸ PAUSED</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">API Calls</p>
            <p className="text-sm text-red-400 font-bold">⏸ STOPPED</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Animations</p>
            <p className="text-sm text-red-400 font-bold">⏸ FROZEN</p>
          </div>
        </motion.div>

        {/* Info Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <p className="text-sm text-white/60">
            The broadcast will resume automatically when the master user unpauses it.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
