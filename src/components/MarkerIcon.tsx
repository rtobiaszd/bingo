import React from 'react';

interface MarkerIconProps {
  iconName: 'fill' | 'dot' | 'check' | 'ring' | 'cross' | 'circle' | 'clover' | 'star' | 'heart' | 'stamp' | 'flame';
  color?: string;
  size?: number;
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({ iconName, color = '#f59e0b', size = 22 }) => {
  switch (iconName) {
    case 'star':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="estrela">
          ⭐
        </span>
      );

    case 'flame':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="fogo">
          🔥
        </span>
      );

    case 'clover':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="trevo">
          🍀
        </span>
      );

    case 'heart':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="coracao">
          ❤️
        </span>
      );

    case 'stamp':
      return (
        <div
          className="rounded-full border-2 border-dashed flex items-center justify-center font-black drop-shadow-md select-none"
          style={{
            borderColor: color,
            color: color,
            width: `${size + 6}px`,
            height: `${size + 6}px`,
            fontSize: `${size * 0.52}px`,
            transform: 'rotate(-10deg)',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          BINGO
        </div>
      );

    case 'circle':
      return (
        <div
          className="rounded-full shadow-lg flex items-center justify-center border-2 border-white/80 select-none"
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 12px ${color}`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      );

    case 'check':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'dot':
      return (
        <span
          className="rounded-full inline-block shadow-md"
          style={{
            backgroundColor: color,
            width: `${Math.max(8, size * 0.5)}px`,
            height: `${Math.max(8, size * 0.5)}px`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      );

    case 'fill':
    default:
      return null;
  }
};
