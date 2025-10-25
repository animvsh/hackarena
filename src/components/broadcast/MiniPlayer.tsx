import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BroadcastCharacter } from './BroadcastCharacter';
import { NewsStudioBackground } from './NewsStudioBackground';

interface MiniPlayerProps {
  narrative?: string;
  isLive?: boolean;
  onClose: () => void;
}

export function MiniPlayer({ narrative, isLive = true, onClose }: MiniPlayerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleExpand = () => {
    navigate('/broadcast');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          });
        }}
        className="fixed bottom-6 right-6 z-50 w-80 aspect-video rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl cursor-move glass-strong"
        style={{
          x: position.x,
          y: position.y,
        }}
      >
        {/* Mini broadcast view */}
        <div className="relative w-full h-full">
          <NewsStudioBackground scene="anchor" />
          
          <BroadcastCharacter
            narrative={narrative || "Live coverage continues..."}
            isLive={isLive}
            isSpeaking={false}
          />

          {/* Controls overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-background/50 backdrop-blur-sm"
              onClick={handleExpand}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-background/50 backdrop-blur-sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-2 px-2 py-1 bg-destructive/90 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white">LIVE</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
