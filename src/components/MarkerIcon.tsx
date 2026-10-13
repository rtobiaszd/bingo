import React from 'react';

interface MarkerIconProps {
  iconName: 'circle' | 'clover' | 'star' | 'heart' | 'stamp' | 'flame';
  color: string;
  size?: number;
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({ iconName, color, size = 26 }) => {
  switch (iconName) {
    case 'clover':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="trevo">
          🍀
        </span>
      );
    case 'star':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="estrela">
          ⭐
        </span>
      );
    case 'heart':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="coracao">
          ❤️
        </span>
      );
    case 'flame':
      return (
        <span style={{ fontSize: `${size}px`, lineHeight: 1 }} role="img" aria-label="fogo">
          🔥
        </span>
      );
    case 'stamp':
      return (
        <div
          className="rounded-full border-2 border-dashed flex items-center justify-center font-black"
          style={{
            borderColor: color,
            color: color,
            width: `${size + 4}px`,
            height: `${size + 4}px`,
            fontSize: `${size * 0.55}px`,
            transform: 'rotate(-12deg)',
          }}
        >
          OK
        </div>
      );
    case 'circle':
    default:
      return (
        <div
          className="rounded-full shadow-inner flex items-center justify-center font-bold"
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            color: '#fff',
            fontSize: `${size * 0.45}px`,
            border: '2px solid rgba(255,255,255,0.7)',
          }}
        >
          •
        </div>
      );
  }
};
