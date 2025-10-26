interface MouthAnimationProps {
  isOpen: boolean;
  position: 'left' | 'right';
}

export function MouthAnimation({ isOpen, position }: MouthAnimationProps) {
  const horizontalPosition = position === 'left' ? 'left-[42%]' : 'left-[42%]';
  
  return (
    <div className={`absolute top-[52%] ${horizontalPosition} w-8 h-6 flex items-center justify-center z-30`}>
      <svg width="24" height="16" viewBox="0 0 24 16" className="transition-all duration-100">
        {isOpen ? (
          // Open mouth
          <g>
            <ellipse cx="12" cy="8" rx="7" ry="6" fill="#2d1810" />
            <ellipse cx="12" cy="5" rx="5" ry="2" fill="#ff9999" />
            <rect x="8" y="4" width="8" height="2" rx="1" fill="white" opacity="0.9" />
          </g>
        ) : (
          // Closed mouth
          <g>
            <ellipse cx="12" cy="8" rx="6" ry="1.5" fill="#8b4513" opacity="0.6" />
            <line x1="6" y1="8" x2="18" y2="8" stroke="#8b4513" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
