import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

type CameraMovement = 'static' | 'truck-left' | 'truck-right' | 'dolly-in' | 'dolly-out' | 'crane-up' | 'crane-down' | 'shake';

interface CameraEffectsProps {
  children: ReactNode;
  movement?: CameraMovement;
  intensity?: number;
}

export function CameraEffects({ children, movement = 'static', intensity = 1 }: CameraEffectsProps) {
  const [currentMovement, setCurrentMovement] = useState<CameraMovement>(movement);

  useEffect(() => {
    setCurrentMovement(movement);
  }, [movement]);

  const getMovementAnimation = () => {
    const baseIntensity = intensity;
    
    switch (currentMovement) {
      case 'truck-left':
        return {
          x: [-10 * baseIntensity, 10 * baseIntensity, -10 * baseIntensity],
        };
      
      case 'truck-right':
        return {
          x: [10 * baseIntensity, -10 * baseIntensity, 10 * baseIntensity],
        };
      
      case 'dolly-in':
        return {
          scale: [1, 1.05 * baseIntensity],
        };
      
      case 'dolly-out':
        return {
          scale: [1.05 * baseIntensity, 1],
        };
      
      case 'crane-up':
        return {
          y: [0, -20 * baseIntensity],
        };
      
      case 'crane-down':
        return {
          y: [-20 * baseIntensity, 0],
        };
      
      case 'shake':
        return {
          x: [0, -2, 2, -2, 2, 0],
          y: [0, 2, -2, 2, -2, 0],
        };
      
      default:
        return {};
    }
  };

  const getTransitionConfig = () => {
    switch (currentMovement) {
      case 'truck-left':
      case 'truck-right':
        return { duration: 8, ease: 'easeInOut' as const, repeat: Infinity };
      case 'dolly-in':
      case 'dolly-out':
        return { duration: 2, ease: 'easeInOut' as const };
      case 'crane-up':
      case 'crane-down':
        return { duration: 3, ease: 'easeInOut' as const };
      case 'shake':
        return { duration: 0.5, ease: 'easeInOut' as const };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="w-full h-full"
      animate={getMovementAnimation()}
      transition={getTransitionConfig()}
    >
      {children}
    </motion.div>
  );
}

export function useAutoCameraMovement(interval = 15000) {
  const [movement, setMovement] = useState<CameraMovement>('static');
  
  const movements: CameraMovement[] = ['static', 'truck-left', 'truck-right', 'dolly-in', 'dolly-out'];

  useEffect(() => {
    const timer = setInterval(() => {
      const randomMovement = movements[Math.floor(Math.random() * movements.length)];
      setMovement(randomMovement);
      
      // Reset to static after movement
      setTimeout(() => setMovement('static'), 3000);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return movement;
}
