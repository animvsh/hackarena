interface MouthAnimationProps {
  isOpen: boolean;
  position: 'left' | 'right';
}

export function MouthAnimation({ isOpen, position }: MouthAnimationProps) {
  const leftPosition = position === 'left' ? 'left-[28%]' : 'right-[28%]';
  
  return (
    <div className={`absolute bottom-[42%] ${leftPosition} w-12 h-8 flex items-center justify-center`}>
      <svg width="32" height="24" viewBox="0 0 32 24" className="transition-all duration-100">
        {isOpen ? (
          // Open mouth
          <g>
            <ellipse cx="16" cy="12" rx="10" ry="8" fill="#2d1810" />
            <ellipse cx="16" cy="8" rx="8" ry="3" fill="#ff9999" />
            <rect x="10" y="6" width="12" height="3" rx="1" fill="white" opacity="0.9" />
          </g>
        ) : (
          // Closed mouth
          <g>
            <ellipse cx="16" cy="12" rx="8" ry="2" fill="#8b4513" opacity="0.6" />
            <line x1="8" y1="12" x2="24" y2="12" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
