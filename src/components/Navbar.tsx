import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Palette, Grid3X3, LogOut, Sparkles, Gift, Users, UserPlus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAuthButton } from './UserAuthButton';

interface NavbarProps {
  roomCode?: string;
  roomMode?: string;
  onOpenCustomizer: () => void;
  onOpenBoard: () => void;
  onLeaveRoom?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenPrizesModal?: () => void;
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
  onOpenAdminDashboard,
  onOpenRegisterModal,
  onOpenPrizesModal,
  sfxActive,
  speechActive,
  onToggleSfx,
  onToggleSpeech,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-sm font-game shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-300">
            B
          </div>
          <span className="text-lg font-black tracking-tight text-white font-display whitespace-nowrap">
            Bingo Club
          </span>
        </a>
        {roomCode && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
            <span className="text-slate-400 font-display">Sala</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20 tabular-nums shadow-sm">
              {roomCode}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 font-semibold">{roomMode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & Tools */}
      <nav className="hidden lg:flex items-center gap-2 text-xs font-bold font-display text-slate-300">
        {onOpenPrizesModal && (
          <button
            onClick={onOpenPrizesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all whitespace-nowrap cursor-pointer text-amber-400"
          >
            <Gift className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Prêmios</span>
          </button>
        )}

        {onOpenRegisterModal && (
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Jogadores</span>
          </button>
        )}

        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap cursor-pointer"
        >
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Personalizar</span>
        </button>

        <button
          onClick={onOpenBoard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap cursor-pointer"
        >
          <Grid3X3 className="w-4 h-4 text-amber-400" />
          <span>Quadro Geral</span>
        </button>

        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
          <button
            onClick={onToggleSpeech}
            title={speechActive ? 'Voz de locução ativada' : 'Voz de locução desativada'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              speechActive
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-500 hover:text-slate-300 bg-white/[0.04]'
            }`}
          >
            {speechActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleSfx}
            title={sfxActive ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              sfxActive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-500 hover:text-slate-300 bg-white/[0.04]'
            }`}
          >
            {sfxActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Zone 3: Actions, Google Login & Registration */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Shortcut Buttons */}
        <div className="flex lg:hidden items-center gap-1">
          {onOpenPrizesModal && (
            <button
              onClick={onOpenPrizesModal}
              className="p-2 text-amber-400 hover:bg-white/[0.08] rounded-xl"
              title="Galeria de Prêmios"
            >
              <Gift className="w-4 h-4" />
            </button>
          )}
          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="p-2 text-emerald-400 hover:bg-white/[0.08] rounded-xl"
              title="Cadastro de Jogador"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cadastro Rápido de Jogador button */}
        {onOpenRegisterModal && (
          <button
            onClick={onOpenRegisterModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Cadastrar meu perfil de jogador"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cadastrar</span>
          </button>
        )}

        {/* Google Auth & Master Admin Button */}
        <UserAuthButton onOpenAdminDashboard={onOpenAdminDashboard || (() => {})} />

        {/* PWA Install in Header */}
        <PWAInstallButton variant="header" />

        {onLeaveRoom ? (
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-display text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 hover:text-white transition-all whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        ) : (
          <button
            onClick={onOpenCustomizer}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black font-display uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl transition-all duration-300 whitespace-nowrap shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cartela</span>
          </button>
        )}
      </div>
    </header>
  );
};
