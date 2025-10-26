import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProductionEffectsProps {
  children: ReactNode;
  filmGrain?: boolean;
  vignette?: boolean;
  colorGrade?: 'warm' | 'cool' | 'neutral';
  letterbox?: boolean;
}

export function ProductionEffects({ 
  children, 
  filmGrain = true, 
  vignette = true, 
  colorGrade = 'warm',
  letterbox = false 
}: ProductionEffectsProps) {
  const getColorGradeFilter = () => {
    switch (colorGrade) {
      case 'warm':
        return 'sepia(0.1) saturate(1.1) brightness(1.05)';
      case 'cool':
        return 'hue-rotate(10deg) saturate(0.95) brightness(0.98)';
      case 'neutral':
        return 'saturate(1.05) contrast(1.02)';
      default:
        return 'none';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main content with color grading */}
      <div
        className="w-full h-full"
        style={{
          filter: getColorGradeFilter(),
        }}
      >
        {children}
      </div>

      {/* Film grain overlay */}
      {filmGrain && (
        <div className="absolute inset-0 pointer-events-none z-[80] opacity-[0.03] mix-blend-overlay">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>
      )}

      {/* Vignette effect */}
      {vignette && (
        <div className="absolute inset-0 pointer-events-none z-[79]">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_60%,rgba(0,0,0,0.3)_100%)]" />
        </div>
      )}

      {/* Letterbox bars */}
      {letterbox && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[8%] bg-black z-[81]" />
          <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black z-[81]" />
        </>
      )}

      {/* Subtle lens flare on dramatic moments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 10 }}
        className="absolute top-1/4 left-1/4 w-64 h-64 pointer-events-none z-[78]"
      >
        <div className="w-full h-full bg-gradient-radial from-white/20 via-transparent to-transparent rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
