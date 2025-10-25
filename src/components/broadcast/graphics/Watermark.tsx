import { motion } from 'framer-motion';

interface WatermarkProps {
  showLiveIndicator?: boolean;
}

export function Watermark({ showLiveIndicator = true }: WatermarkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
      className="absolute top-20 right-8 z-[35] pointer-events-none"
    >
      <div className="relative">
        {/* Main logo */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-black text-lg">H</span>
            </div>
            <div className="text-sm">
              <div className="font-black text-foreground leading-none tracking-tight">
                HACKCAST
              </div>
              <div className="text-[10px] text-primary font-bold tracking-wider">
                LIVE
              </div>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        {showLiveIndicator && (
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-destructive rounded-full border-2 border-background shadow-lg"
          />
        )}

        {/* Subtle glow effect */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-primary/20 rounded-xl blur-xl -z-10"
        />
      </div>
    </motion.div>
  );
}
