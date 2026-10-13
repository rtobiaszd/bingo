import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Palette, Grid3X3, LogOut, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

interface NavbarProps {
  roomCode?: string;
  roomMode?: string;
  onOpenCustomizer: () => void;
  onOpenBoard: () => void;
  onLeaveRoom?: () => void;
  sfxActive: boolean;
  speechActive: boolean;
  onToggleSfx: () => void;
  onToggleSpeech: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  roomMode,
  onOpenCustomizer,
  onOpenBoard,
  onLeaveRoom,
  sfxActive,
  speechActive,
  onToggleSfx,
  onToggleSpeech,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-8 transition-all">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-100 whitespace-nowrap">
            Bingo Real-Time Club
          </span>
        </a>
        {roomCode && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
            <span>Sala:</span>
            <span className="font-mono font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {roomCode}
            </span>
            <span className="text-zinc-600">·</span>
            <span>{roomMode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & Tool Controls */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-400">
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Personalizar Cartela</span>
        </button>

        <button
          onClick={onOpenBoard}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
        >
          <Grid3X3 className="w-4 h-4 text-zinc-400" />
          <span>Quadro Geral</span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
          <button
            onClick={onToggleSpeech}
            title={speechActive ? 'Voz de locução ativada' : 'Voz de locução desativada'}
            className={`p-1.5 rounded-md transition-colors ${
              speechActive ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {speechActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleSfx}
            title={sfxActive ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados'}
            className={`p-1.5 rounded-md transition-colors ${
              sfxActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {sfxActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile quick tools */}
        <div className="flex md:hidden items-center gap-1 mr-1">
          <button
            onClick={onOpenCustomizer}
            className="p-2 text-amber-400 hover:bg-zinc-900 rounded-lg"
            title="Personalizar"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBoard}
            className="p-2 text-zinc-400 hover:bg-zinc-900 rounded-lg"
            title="Quadro Geral"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {onLeaveRoom ? (
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700/80 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sair da Sala</span>
          </button>
        ) : (
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configurar Cartela</span>
          </button>
        )}
      </div>
    </header>
  );
};
