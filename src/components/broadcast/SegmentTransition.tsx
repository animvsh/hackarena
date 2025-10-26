import { motion, AnimatePresence } from 'framer-motion';
import type { BroadcastScene } from '@/types/broadcast';

interface SegmentTransitionProps {
  isActive: boolean;
  fromScene: BroadcastScene | null;
  toScene: BroadcastScene;
  onComplete: () => void;
}

export function SegmentTransition({ isActive, fromScene, toScene, onComplete }: SegmentTransitionProps) {
  const getTransitionStyle = () => {
    const transitions: Record<string, string> = {
      'anchor-team': 'wipe-right',
      'team-market': 'swoosh',
      'market-stats': 'cross-fade',
      'stats-highlight': 'zoom',
      'highlight-anchor': 'spin',
      'default': 'cross-fade',
    };
    
    const key = `${fromScene}-${toScene}`;
    return transitions[key] || transitions.default;
  };

  const transitionStyle = getTransitionStyle();

  if (!isActive) return null;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div className="absolute inset-0 z-[60] pointer-events-none">
        {/* Wipe Right */}
        {transitionStyle === 'wipe-right' && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-transparent"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-pulse" />
          </motion.div>
        )}

        {/* Swoosh */}
        {transitionStyle === 'swoosh' && (
          <>
            <motion.div
              initial={{ scale: 0.5, x: '-100%', opacity: 0 }}
              animate={{ scale: 1.5, x: '100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-transparent blur-xl"
            />
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: window.innerWidth + 100, opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="absolute top-1/2 h-1 w-32 bg-primary/50"
                style={{ marginTop: `${(i - 2) * 40}px` }}
              />
            ))}
          </>
        )}

        {/* Cross Fade */}
        {transitionStyle === 'cross-fade' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Zoom */}
        {transitionStyle === 'zoom' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full bg-gradient-radial from-primary/50 via-accent/30 to-transparent" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 0.7 }}
              className="absolute w-32 h-32 border-8 border-primary rounded-full"
            />
          </motion.div>
        )}

        {/* Spin */}
        {transitionStyle === 'spin' && (
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-background"
            style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-30"
            />
          </motion.div>
        )}

        {/* Transition indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-2 rounded-full border border-primary/20"
        >
          <span className="text-sm font-bold text-primary uppercase tracking-wider">
            {toScene.replace('-', ' ')}
          </span>
        </motion.div>

        {/* Sound effect indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 right-8 text-4xl"
        >
          🔊
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
