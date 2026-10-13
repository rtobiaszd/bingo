import React from 'react';
import { BingoMode, RoomStatus } from '../types/bingo';
import { get75BallLetter, getBallColor } from '../utils/bingoRules';
import { Trophy, Volume2 } from 'lucide-react';

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
  const ballBgColor =
    currentBall !== null ? getBallColor(currentBall, mode) : '#3f3f46';

  return (
    <div className="w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
      {/* Left: Ball Spinner & Main Caller */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Main 3D Ball Sphere */}
        <div className="relative group">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 relative overflow-hidden ${
              status === 'PLAYING' && currentBall !== null ? 'animate-bounce-subtle' : ''
            }`}
            style={{
              background: `radial-gradient(circle at 35% 30%, ${ballBgColor}, #09090b)`,
              boxShadow: `0 10px 25px -5px ${ballBgColor}60, inset 0 -4px 10px rgba(0,0,0,0.6), inset 0 3px 6px rgba(255,255,255,0.4)`,
            }}
          >
            {/* Shimmer light */}
            <div className="absolute top-1.5 left-4 w-6 h-3 rounded-full bg-white/30 blur-[1px] transform -rotate-25 pointer-events-none" />

            {currentBall !== null ? (
              <>
                {currentLetter && (
                  <span className="text-xs md:text-sm font-black tracking-widest text-amber-200 uppercase drop-shadow-sm">
                    {currentLetter}
                  </span>
                )}
                <span className="text-2xl md:text-3xl font-black font-mono tracking-tighter drop-shadow-md">
                  {currentBall}
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-zinc-400 text-center px-2">
                Aguardando início
              </span>
            )}
          </div>
        </div>

        {/* Text Details & Counters */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Última Pedra
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {currentBall !== null ? (
              <span>
                {currentLetter ? `${currentLetter} - ` : 'Bola '}
                {currentBall}
              </span>
            ) : (
              <span className="text-zinc-500 text-base font-normal">Globo parado</span>
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 font-mono">
            <span>{drawnCount}</span>
            <span className="text-zinc-600"> / </span>
            <span>{totalBalls} sorteadas</span>
          </div>
        </div>
      </div>

      {/* Middle: Previous Balls Trail */}
      <div className="flex-1 w-full md:w-auto flex flex-col items-center md:items-start overflow-hidden">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 self-start">
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
                  className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-white shrink-0 border border-white/10 shadow-sm"
                  style={{
                    backgroundColor: color,
                    opacity: Math.max(0.4, 1 - idx * 0.1),
                  }}
                  title={letter ? `${letter}-${b}` : `Bola ${b}`}
                >
                  {letter && <span className="text-[9px] font-bold leading-none">{letter}</span>}
                  <span className="text-xs font-bold font-mono leading-none">{b}</span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-zinc-500 italic">Nenhuma pedra anterior</span>
          )}
        </div>
      </div>

      {/* Right: Primary Claim BINGO Button */}
      <div className="shrink-0 w-full md:w-auto">
        <button
          onClick={onClaimBingo}
          disabled={!canClaim}
          className={`w-full md:w-auto px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
            canClaim
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
          }`}
        >
          <Trophy className="w-5 h-5 text-zinc-950" />
          <span>Gritar BINGO!</span>
        </button>
      </div>
    </div>
  );
};
