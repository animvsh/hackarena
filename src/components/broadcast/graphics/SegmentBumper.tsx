import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, Trophy, Users } from 'lucide-react';
import type { BroadcastScene } from '@/types/broadcast';

interface SegmentBumperProps {
  scene: BroadcastScene;
  onComplete: () => void;
}

export function SegmentBumper({ scene, onComplete }: SegmentBumperProps) {
  const getSceneData = () => {
    switch (scene) {
      case 'team':
        return {
          icon: Users,
          title: 'TEAM SPOTLIGHT',
          subtitle: 'Inside the competition',
          color: 'from-primary to-accent',
          bgPattern: 'from-primary/20 to-accent/20',
        };
      case 'market':
        return {
          icon: TrendingUp,
          title: 'MARKET WATCH',
          subtitle: 'Live odds & predictions',
          color: 'from-accent to-success',
          bgPattern: 'from-accent/20 to-success/20',
        };
      case 'stats':
        return {
          icon: BarChart3,
          title: 'STATS BREAKDOWN',
          subtitle: 'By the numbers',
          color: 'from-success to-primary',
          bgPattern: 'from-success/20 to-primary/20',
        };
      case 'highlight':
        return {
          icon: Trophy,
          title: 'HIGHLIGHTS',
          subtitle: 'Top moments',
          color: 'from-destructive to-accent',
          bgPattern: 'from-destructive/20 to-accent/20',
        };
      default:
        return {
          icon: Users,
          title: 'HACKCAST LIVE',
          subtitle: 'Real-time coverage',
          color: 'from-primary to-accent',
          bgPattern: 'from-primary/20 to-accent/20',
        };
    }
  };

  const data = getSceneData();
  const Icon = data.icon;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[70] flex items-center justify-center bg-background/95 backdrop-blur-xl"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-0 bg-gradient-to-br ${data.bgPattern} opacity-30`}
            style={{
              backgroundSize: '400% 400%',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-[size:40px_40px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
            className="flex justify-center"
          >
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center shadow-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className={`text-6xl font-black bg-gradient-to-r ${data.color} bg-clip-text text-transparent tracking-tight`}>
              {data.title}
            </h2>
            <p className="text-xl text-muted-foreground font-light tracking-wide">
              {data.subtitle}
            </p>
          </motion.div>

          {/* Decorative lines */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <div className={`h-1 w-32 bg-gradient-to-r ${data.color}`} />
            <div className={`h-1 w-32 bg-gradient-to-l ${data.color}`} />
          </motion.div>
        </div>

        {/* Sound effect indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute top-8 right-8 flex items-center gap-2 text-muted-foreground"
        >
          <span className="text-2xl">🎵</span>
          <span className="text-sm font-mono">SEGMENT THEME</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
