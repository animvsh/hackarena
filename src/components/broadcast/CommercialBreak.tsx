import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommercialBreakProps {
  duration?: number; // in seconds
  onComplete: () => void;
}

export function CommercialBreak({ duration = 30, onComplete }: CommercialBreakProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentSponsor, setCurrentSponsor] = useState(0);

  const sponsors = [
    { name: 'HackCast Live', tagline: 'Where predictions meet reality' },
    { name: 'Innovation Hub', tagline: 'Building the future, today' },
    { name: 'CodeStream', tagline: 'Your development partner' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const sponsorRotation = setInterval(() => {
      setCurrentSponsor(prev => (prev + 1) % sponsors.length);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(sponsorRotation);
    };
  }, [duration, onComplete, sponsors.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-br from-card via-background to-card flex items-center justify-center"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:50px_50px]" />
      </div>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center space-y-12 px-8">
        {/* We'll be right back message */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-black text-foreground">
            WE'LL BE
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RIGHT BACK
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </motion.div>

        {/* Countdown timer */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-primary/20 px-8 py-4 rounded-2xl"
        >
          <div className="text-5xl font-mono font-bold text-primary">
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </motion.div>

        {/* Sponsor carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSponsor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Brought to you by
            </p>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-foreground">
                {sponsors[currentSponsor].name}
              </h3>
              <p className="text-lg text-muted-foreground italic">
                {sponsors[currentSponsor].tagline}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sound indicator */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2 text-muted-foreground/60"
        >
          <span className="text-2xl">🎵</span>
          <span className="text-sm font-mono">INTERMISSION MUSIC</span>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
    </motion.div>
  );
}
