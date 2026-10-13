import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Palette, Grid3X3, LogOut, Sliders } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3 flex items-center justify-between gap-8 transition-all">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100 font-bold text-xs font-mono">
            B
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-100 whitespace-nowrap">
            Bingo Club
          </span>
        </a>
        {roomCode && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
            <span>Sala</span>
            <span className="font-mono font-semibold text-zinc-200 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-700/60 tabular-nums">
              {roomCode}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">{roomMode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & Controls */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-400">
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors whitespace-nowrap shrink-0 py-1"
        >
          <Palette className="w-3.5 h-3.5 text-zinc-400" />
          <span>Visual da Cartela</span>
        </button>

        <button
          onClick={onOpenBoard}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors whitespace-nowrap shrink-0 py-1"
        >
          <Grid3X3 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Quadro de Pedras</span>
        </button>

        <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-800">
          <button
            onClick={onToggleSpeech}
            title={speechActive ? 'Voz de locução ativada' : 'Voz de locução desativada'}
            className={`p-1.5 rounded-md transition-colors ${
              speechActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {speechActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleSfx}
            title={sfxActive ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados'}
            className={`p-1.5 rounded-md transition-colors ${
              sfxActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {sfxActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex md:hidden items-center gap-1 mr-1">
          <button
            onClick={onOpenCustomizer}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md"
            title="Personalizar"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBoard}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md"
            title="Quadro Geral"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {onLeaveRoom ? (
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 rounded-md hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span>Sair</span>
          </button>
        ) : (
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferências</span>
          </button>
        )}
      </div>
    </header>
  );
};
