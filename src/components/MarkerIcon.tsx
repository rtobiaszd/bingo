import React from 'react';

interface MarkerIconProps {
  iconName: 'fill' | 'dot' | 'check' | 'ring' | 'cross' | 'circle' | 'clover' | 'star' | 'heart' | 'stamp' | 'flame';
  color?: string;
  size?: number;
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({ iconName, size = 18 }) => {
  switch (iconName) {
    case 'dot':
      return (
        <span
          className="rounded-full bg-current inline-block opacity-80"
          style={{ width: `${Math.max(6, size * 0.45)}px`, height: `${Math.max(6, size * 0.45)}px` }}
        />
      );

    case 'check':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-95"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'ring':
      return (
        <span
          className="rounded-full border-2 border-current inline-block opacity-85"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      );

    case 'cross':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );

    case 'fill':
    default:
      // When 'fill' is chosen, the entire cell background indicates marked state cleanly.
      return null;
  }
};
