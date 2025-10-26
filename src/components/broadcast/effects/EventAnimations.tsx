import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Trophy, CheckCircle, AlertCircle } from 'lucide-react';

type EventType = 'big-bet' | 'odds-surge' | 'team-milestone' | 'prediction-win' | 'market-close';

interface EventAnimationProps {
  isActive: boolean;
  eventType: EventType;
  data?: {
    amount?: number;
    teamName?: string;
    metric?: string;
  };
  onComplete?: () => void;
}

export function EventAnimations({ isActive, eventType, data, onComplete }: EventAnimationProps) {
  const getEventConfig = () => {
    switch (eventType) {
      case 'big-bet':
        return {
          icon: DollarSign,
          title: 'BIG BET ALERT',
          subtitle: `$${data?.amount?.toLocaleString()} placed`,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/20',
          particleColor: 'bg-yellow-500',
        };
      
      case 'odds-surge':
        return {
          icon: TrendingUp,
          title: 'ODDS SURGE',
          subtitle: `${data?.teamName} momentum building`,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/20',
          particleColor: 'bg-green-500',
        };
      
      case 'team-milestone':
        return {
          icon: Trophy,
          title: 'MILESTONE ACHIEVED',
          subtitle: `${data?.teamName} - ${data?.metric}`,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-500/20',
          particleColor: 'bg-purple-500',
        };
      
      case 'prediction-win':
        return {
          icon: CheckCircle,
          title: 'PREDICTION WON!',
          subtitle: `${data?.teamName} prediction successful`,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-500/20',
          particleColor: 'bg-green-500',
        };
      
      case 'market-close':
        return {
          icon: AlertCircle,
          title: 'MARKET CLOSED',
          subtitle: 'Final results being calculated',
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-500/20',
          particleColor: 'bg-red-500',
        };
      
      default:
        return {
          icon: AlertCircle,
          title: 'EVENT',
          subtitle: 'Something happened',
          color: 'from-primary to-accent',
          bgColor: 'bg-primary/20',
          particleColor: 'bg-primary',
        };
    }
  };

  const config = getEventConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[65] pointer-events-none flex items-center justify-center"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${config.bgColor} backdrop-blur-sm`}
          />

          {/* Particle burst */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: Math.cos((i / 20) * Math.PI * 2) * 300,
                y: Math.sin((i / 20) * Math.PI * 2) * 300,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                delay: i * 0.02,
              }}
              className={`absolute w-3 h-3 ${config.particleColor} rounded-full`}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
            className="relative z-10"
          >
            <div className={`bg-gradient-to-br ${config.color} p-1 rounded-3xl shadow-2xl`}>
              <div className="bg-background/95 backdrop-blur-md rounded-3xl px-12 py-8 space-y-4">
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: 2,
                  }}
                  className="flex justify-center"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Text */}
                <div className="text-center space-y-2">
                  <motion.h3
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className={`text-4xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                  >
                    {config.title}
                  </motion.h3>
                  <p className="text-lg text-muted-foreground font-medium">
                    {config.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Screen shake effect indicator */}
          {(eventType === 'big-bet' || eventType === 'team-milestone') && (
            <motion.div
              animate={{ x: [-2, 2, -2, 2, 0], y: [2, -2, 2, -2, 0] }}
              transition={{ duration: 0.4, repeat: 2 }}
              className="absolute inset-0"
            />
          )}

          {/* Sound effect indicator */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-8 right-8 text-4xl"
          >
            🔊
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
