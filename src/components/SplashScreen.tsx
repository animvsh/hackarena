import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hackcastLogo from "@/assets/hackcast-logo.png";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing HackMarket...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messages = [
      'Initializing HackMarket...',
      'Connecting to live feed...',
      'Loading real-time odds...',
      'Broadcasting in 3... 2... 1...',
    ];

    let currentMessage = 0;
    const messageInterval = setInterval(() => {
      currentMessage = (currentMessage + 1) % messages.length;
      setLoadingText(messages[currentMessage]);
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete?.(), 500);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'pulse 4s ease-in-out infinite'
            }} />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-4">
            {/* Logo with glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.5)',
                    '0 0 60px hsl(var(--primary) / 0.8)',
                    '0 0 20px hsl(var(--primary) / 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-2xl p-8 bg-card/50 backdrop-blur-xl border border-primary/20"
              >
                <img src={hackcastLogo} alt="HackCast LIVE" className="h-24 md:h-32" />
              </motion.div>

              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl border-2 border-primary/30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl border-2 border-neon-blue/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.div
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm md:text-base text-muted-foreground font-medium"
            >
              {loadingText}
            </motion.div>

            {/* Progress bar */}
            <div className="w-64 md:w-80 space-y-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-neon-blue to-neon-purple rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-xs text-right text-muted-foreground font-mono">
                {progress}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
