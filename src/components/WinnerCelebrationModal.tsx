import React, { useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, X, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WinnerAudit } from '../types/bingo';

interface WinnerCelebrationModalProps {
  winner: WinnerAudit | null;
  isHost: boolean;
  prizeTitle?: string;
  prizeImageUrl?: string;
  onRestartRound: () => void;
  onClose: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  winner,
  isHost,
  prizeTitle,
  prizeImageUrl,
  onRestartRound,
  onClose,
}) => {
  const triggerCelebrationConfetti = useCallback(() => {
    // 1. Dual side cannon blast
    const count = 180;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    // Left cannon
    fire(0.25, {
      spread: 45,
      startVelocity: 55,
      origin: { x: 0.15, y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
    });

    // Right cannon
    fire(0.25, {
      spread: 45,
      startVelocity: 55,
      origin: { x: 0.85, y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
    });

    // Center burst
    fire(0.2, {
      spread: 80,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#ffd700', '#ff9900', '#ff0055', '#00ffcc'],
    });

    fire(0.3, {
      spread: 120,
      decay: 0.91,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.65 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#f43f5e'],
    });
  }, []);

  // Automatically trigger confetti when modal opens with a winner
  useEffect(() => {
    if (!winner) return;

    // Initial festive burst
    triggerCelebrationConfetti();

    // Cascading sparkles shower across 2.5 seconds
    const end = Date.now() + 2500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f43f5e'],
        zIndex: 9999,
        shapes: ['circle', 'square'],
        scalar: 1.1,
      });
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [winner, triggerCelebrationConfetti]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-400/50 p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Ambient celebration spotlights */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Golden Trophy Spotlight */}
        <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 blur-xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest font-display mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Vitória Confirmada!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 font-display tracking-tight drop-shadow-md mb-4">
          BINGOOOO!
        </h2>

        {/* Winner Hero Card */}
        <div className="p-4 rounded-2xl bg-white/[0.05] border border-amber-400/30 flex items-center justify-center gap-3.5 mb-6 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 flex items-center justify-center text-3xl shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              {winner.winnerAvatar}
            </div>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-display block">
              Campeão da Rodada
            </span>
            <h3 className="text-lg font-black text-white font-display leading-tight">
              {winner.winnerName}
            </h3>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-display">
              {winner.winningPattern}
            </span>
          </div>
        </div>

        {/* Prize Award Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/10 border border-amber-400/40 mb-5 flex items-center gap-3 text-left">
          <img
            src={prizeImageUrl || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
            alt={prizeTitle || 'Prêmio do Bingo'}
            className="w-16 h-16 rounded-xl object-cover border border-amber-400/50 shadow-md shrink-0"
          />
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider">
              🎁 PRÊMIO CONQUISTADO
            </span>
            <p className="text-xs sm:text-sm font-black text-white font-display line-clamp-1">
              {prizeTitle || 'Smart TV 55" 4K Crystal UHD'}
            </p>
            <p className="text-[11px] text-slate-300">
              Parabéns! O prêmio foi auditado e garantido nesta rodada.
            </p>
          </div>
        </div>

        {/* Interactive Confetti Popper Trigger */}
        <div className="mb-5 flex justify-center">
          <button
            onClick={triggerCelebrationConfetti}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10 font-display"
            title="Lançar mais confetes!"
          >
            <PartyPopper className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Lançar Mais Confetes!</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5">
          {isHost ? (
            <button
              onClick={onRestartRound}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 cursor-pointer active:scale-95 border-2 border-amber-300"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>INICIAR NOVA RODADA</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-xs font-bold font-display text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 transition-all cursor-pointer"
            >
              Fechar e Ver Mesa
            </button>
          )}

          <p className="text-[11px] text-slate-400 font-display">
            Todas as pedras foram conferidas e auditadas pelo sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
