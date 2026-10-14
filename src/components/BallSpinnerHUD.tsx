import React from 'react';
import { BingoMode, RoomStatus } from '../types/bingo';
import { get75BallLetter, getBallColor } from '../utils/bingoRules';
import { Trophy, Sparkles } from 'lucide-react';

interface BallSpinnerHUDProps {
  mode: BingoMode;
  status: RoomStatus;
  currentBall: number | null;
  previousBalls: number[];
  drawnCount: number;
  totalBalls: number;
  onClaimBingo: () => void;
  canClaim: boolean;
}

export const BallSpinnerHUD: React.FC<BallSpinnerHUDProps> = ({
  mode,
  status,
  currentBall,
  previousBalls,
  drawnCount,
  totalBalls,
  onClaimBingo,
  canClaim,
}) => {
  const currentLetter =
    currentBall !== null && mode === 'BINGO_75' ? get75BallLetter(currentBall) : null;
  const ballColor = currentBall !== null ? getBallColor(currentBall, mode) : '#475569';

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Ambient decorative glowing backdrops */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-500"
        style={{ backgroundColor: ballColor }}
      />
      <div className="absolute -bottom-10 right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Spotlight Ball & Details */}
      <div className="flex items-center gap-5 shrink-0 w-full sm:w-auto z-10">
        {/* Spotlight Animated Ball Sphere with 3D Levitation & Rotation */}
        <div className="relative group shrink-0 flex flex-col items-center justify-center py-1" style={{ perspective: '800px' }}>
          <div
            key={currentBall ?? 'empty'}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-white relative transition-all duration-300 shadow-2xl select-none ${
              currentBall !== null ? 'animate-ball-3d' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              background:
                currentBall !== null
                  ? `radial-gradient(circle at 32% 28%, #ffffff 0%, rgba(255,255,255,0.7) 12%, ${ballColor} 45%, #070d19 100%)`
                  : 'radial-gradient(circle at 35% 30%, #475569, #0f172a)',
              border: '2px solid rgba(255,255,255,0.45)',
              boxShadow:
                currentBall !== null
                  ? `0 14px 28px -4px rgba(0,0,0,0.75), 0 0 25px ${ballColor}70, inset 0 -6px 14px rgba(0,0,0,0.65), inset 0 4px 8px rgba(255,255,255,0.5)`
                  : '0 8px 16px rgba(0,0,0,0.4)',
            }}
          >
            {/* 3D Specular highlight reflection */}
            {currentBall !== null && (
              <div
                className="absolute top-1.5 left-3 w-6 h-3 sm:w-8 sm:h-4 bg-white/40 rounded-full blur-[1px] pointer-events-none"
                style={{ transform: 'rotate(-38deg)' }}
              />
            )}

            {/* Ball number content in 3D relief */}
            <div className="flex flex-col items-center justify-center" style={{ transform: 'translateZ(12px)' }}>
              {currentBall !== null ? (
                <>
                  {currentLetter && (
                    <span className="text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {currentLetter}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-game leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] text-white">
                    {currentBall}
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 font-display text-center uppercase tracking-wider px-1">
                  Pronto
                </span>
              )}
            </div>
          </div>

          {/* Dynamic 3D ground shadow underneath the floating ball */}
          {currentBall !== null && (
            <div
              className="w-12 sm:w-16 h-2 bg-black/60 rounded-full blur-[3px] mt-1.5 animate-ball-shadow pointer-events-none"
              style={{ transformStyle: 'preserve-3d' }}
            />
          )}
        </div>

        {/* Text Details & Counters */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest font-display">
              Última Pedra
            </span>
            {status === 'PLAYING' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
            {currentBall !== null ? (
              <span>
                {currentLetter ? `${currentLetter} - ` : 'Bola '}
                {currentBall}
              </span>
            ) : (
              <span className="text-slate-400 text-sm font-normal">Aguardando sorteio...</span>
            )}
          </div>
          <div className="text-xs text-slate-300 font-display mt-0.5 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold font-game text-sm">{drawnCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-game text-sm">{totalBalls}</span>
            <span className="text-slate-400">pedras sorteadas</span>
          </div>
        </div>
      </div>

      {/* Middle: Recent Balls Trail (Gamified orbs) */}
      <div className="flex-1 w-full lg:w-auto flex flex-col items-start overflow-hidden z-10">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display mb-2">
          Pedras Anteriores
        </span>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin">
          {previousBalls.length > 0 ? (
            previousBalls.map((b, idx) => {
              const letter = mode === 'BINGO_75' ? get75BallLetter(b) : null;
              const color = getBallColor(b, mode);
              return (
                <div
                  key={`${b}-${idx}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center text-white shrink-0 border border-white/20 shadow-lg transition-transform hover:scale-110 select-none"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${color} 50%, #0f172a 100%)`,
                    opacity: Math.max(0.45, 1 - idx * 0.08),
                  }}
                  title={letter ? `${letter}-${b}` : `Número ${b}`}
                >
                  {letter && (
                    <span className="text-[9px] font-black leading-none text-amber-200 font-display">
                      {letter}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-bold font-game leading-none text-white drop-shadow">
                    {b}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-slate-500 font-display italic py-2">
              As próximas bolas sorteadas aparecerão aqui...
            </span>
          )}
        </div>
      </div>

      {/* Right: Gamified Glowing BINGO Button */}
      <div className="shrink-0 w-full lg:w-auto z-10">
        <button
          onClick={onClaimBingo}
          disabled={!canClaim}
          className={`w-full lg:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest font-display flex items-center justify-center gap-2.5 transition-all duration-300 shadow-2xl select-none ${
            canClaim
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.5)] border-2 border-amber-300 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
          title="Gritar Bingo e conferir sua cartela vitoriosa"
        >
          <Trophy className="w-5 h-5 text-slate-950" />
          <span>GRITAR BINGO!</span>
        </button>
      </div>
    </div>
  );
};
