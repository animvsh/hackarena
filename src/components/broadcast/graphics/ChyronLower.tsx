import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ChyronLowerProps {
  name: string;
  title: string;
  style?: 'standard' | 'breaking' | 'analysis' | 'interview';
  position?: 'left' | 'right' | 'center';
  accentColor?: string;
}

export function ChyronLower({ 
  name, 
  title, 
  style = 'standard', 
  position = 'left',
  accentColor = 'hsl(var(--primary))'
}: ChyronLowerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000); // Auto-dismiss after 8 seconds

    return () => clearTimeout(timer);
  }, [name, title]);

  const getPositionClass = () => {
    switch (position) {
      case 'left': return 'left-8';
      case 'right': return 'right-8';
      case 'center': return 'left-1/2 -translate-x-1/2';
      default: return 'left-8';
    }
  };

  const getStyleClasses = () => {
    switch (style) {
      case 'breaking':
        return 'bg-destructive/90 border-destructive';
      case 'analysis':
        return 'bg-accent/90 border-accent';
      case 'interview':
        return 'bg-muted/90 border-muted-foreground';
      default:
        return 'bg-card/95 border-primary/30';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: position === 'right' ? 500 : -500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: position === 'right' ? 500 : -500, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
          className={`absolute bottom-24 ${getPositionClass()} z-40`}
        >
          <div className={`${getStyleClasses()} backdrop-blur-md border-l-4 rounded-r-lg overflow-hidden shadow-2xl`}>
            {/* Accent bar animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute left-0 top-0 bottom-0 w-1 origin-left"
              style={{ backgroundColor: accentColor }}
            />

            <div className="pl-4 pr-6 py-3 space-y-0.5">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-bold text-foreground tracking-wide"
              >
                {name}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground uppercase tracking-wider"
              >
                {title}
              </motion.p>
            </div>

            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ width: '50%' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
