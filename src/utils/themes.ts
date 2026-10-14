import { CardTheme, MarkerStyle } from '../types/bingo';

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'neon_night',
    name: 'Azul Noturno & Neon',
    cardBg: 'bg-slate-900/60 backdrop-blur-xl',
    cardBorder: 'border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)]',
    headerBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    headerText: 'text-slate-950 font-black',
    cellBg: 'bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md',
    cellText: 'text-slate-100',
    cellBorder: 'border border-white/10',
    markedBg: 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)]',
    markedText: 'text-white font-black drop-shadow-md',
    accent: '#06b6d4',
  },
  {
    id: 'royal_gold',
    name: 'Esmeralda & Ouro Imperial',
    cardBg: 'bg-emerald-950/40 backdrop-blur-xl',
    cardBorder: 'border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)]',
    headerBg: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
    headerText: 'text-slate-950 font-black',
    cellBg: 'bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md',
    cellText: 'text-amber-100',
    cellBorder: 'border border-white/10',
    markedBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    markedText: 'text-slate-950 font-black drop-shadow-sm',
    accent: '#f59e0b',
  },
  {
    id: 'cyber_purple',
    name: 'Roxo Cósmico & Magenta',
    cardBg: 'bg-purple-950/40 backdrop-blur-xl',
    cardBorder: 'border border-fuchsia-500/30 shadow-[0_0_35px_rgba(217,70,239,0.15)]',
    headerBg: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500',
    headerText: 'text-white font-black',
    cellBg: 'bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md',
    cellText: 'text-fuchsia-50',
    cellBorder: 'border border-white/10',
    markedBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-[0_0_20px_rgba(217,70,239,0.6)]',
    markedText: 'text-white font-black drop-shadow-md',
    accent: '#d946ef',
  },
  {
    id: 'electric_mint',
    name: 'Menta Elétrico',
    cardBg: 'bg-zinc-900/60 backdrop-blur-xl',
    cardBorder: 'border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.15)]',
    headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    headerText: 'text-slate-950 font-black',
    cellBg: 'bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md',
    cellText: 'text-emerald-50',
    cellBorder: 'border border-white/10',
    markedBg: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    markedText: 'text-slate-950 font-black drop-shadow-sm',
    accent: '#10b981',
  },
];

export const MARKER_STYLES: MarkerStyle[] = [
  { id: 'stamp_glow', name: 'Carimbo com Brilho', iconName: 'stamp', color: '#f59e0b' },
  { id: 'star_neon', name: 'Estrela Dourada', iconName: 'star', color: '#eab308' },
  { id: 'fire_pulse', name: 'Chama da Vitória', iconName: 'flame', color: '#f97316' },
  { id: 'clover_lucky', name: 'Trevo da Sorte', iconName: 'clover', color: '#10b981' },
  { id: 'heart_ruby', name: 'Coração Rubi', iconName: 'heart', color: '#ef4444' },
  { id: 'chip_casino', name: 'Ficha Neon', iconName: 'circle', color: '#06b6d4' },
];

export const AVATARS = [
  '👑', '⭐', '🦁', '💎', '🚀', '🍀', '🔥', '🏆', '🎯', '⚡', '🐱', '☕'
];
