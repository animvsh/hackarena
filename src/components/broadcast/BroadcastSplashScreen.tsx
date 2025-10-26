import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hackcastLogo from "@/assets/hackcast-logo.png";

interface BroadcastSplashScreenProps {
  onComplete: () => void;
}

export function BroadcastSplashScreen({ onComplete }: BroadcastSplashScreenProps) {
  const [stage, setStage] = useState<'logo' | 'title' | 'countdown' | 'complete'>('logo');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Logo reveal
    timers.push(setTimeout(() => setStage('title'), 1500));
    
    // Title card
    timers.push(setTimeout(() => setStage('countdown'), 3000));
    
    // Countdown
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setStage('complete');
          setTimeout(onComplete, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
    timers.push(countdownTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-br from-broadcast-blue via-broadcast-blue-dark to-black flex items-center justify-center overflow-hidden"
      >
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:60px_60px] animate-pulse" />
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0,
              }}
              animate={{
                y: [null, -100],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Logo reveal stage */}
          {stage === 'logo' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1.5, bounce: 0.4 }}
            >
              <div className="mx-auto mb-8 flex items-center justify-center">
                <img src={hackcastLogo} alt="HackCast LIVE" className="h-32 md:h-40 drop-shadow-2xl" />
              </div>
            </motion.div>
          )}

          {/* Title card stage */}
          {(stage === 'title' || stage === 'countdown') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center"
              >
                <img src={hackcastLogo} alt="HackCast LIVE" className="h-32 md:h-48 drop-shadow-2xl" />
              </motion.div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                FROM THE HACKATHON FLOOR
              </motion.p>

              <motion.div
                className="text-sm text-muted-foreground/60 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Countdown stage */}
          {stage === 'countdown' && countdown > 0 && (
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-[20rem] font-black text-primary/20 leading-none">
                {countdown}
              </div>
            </motion.div>
          )}

          {/* Live indicator */}
          {stage === 'countdown' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-destructive/20 border border-destructive px-6 py-3 rounded-full backdrop-blur-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-destructive rounded-full"
              />
              <span className="text-destructive font-bold text-lg">GOING LIVE</span>
            </motion.div>
          )}
        </div>

        {/* Sound effect indicators */}
        <motion.div
          className="absolute top-8 right-8 flex gap-2 text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-2xl">🎵</span>
          <span className="text-sm font-mono">THEME MUSIC</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
