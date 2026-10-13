import React from 'react';
import { BingoMode, RoomStatus } from '../types/bingo';
import { get75BallLetter, getBallColor } from '../utils/bingoRules';
import { Check } from 'lucide-react';

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
  const ballColor = currentBall !== null ? getBallColor(currentBall, mode) : '#3f3f46';

  return (
    <div className="w-full bg-[#18191e] border border-zinc-800 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 transition-all">
      {/* Left: Flat Minimal Current Ball Display */}
      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
        {/* Flat Minimal Ball Display with smooth slide */}
        <div
          key={currentBall ?? 'empty'}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg flex flex-col items-center justify-center border border-zinc-700/80 transition-all animate-ball-slide shrink-0 select-none"
          style={{
            backgroundColor: currentBall !== null ? '#202227' : '#1a1c20',
          }}
        >
          {currentBall !== null ? (
            <>
              {currentLetter && (
                <span
                  className="text-[11px] font-bold tracking-wider uppercase font-mono"
                  style={{ color: ballColor }}
                >
                  {currentLetter}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 tabular-nums leading-none">
                {currentBall}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-zinc-500 font-medium text-center px-1">
              Pronto
            </span>
          )}
        </div>

        {/* Current State Text */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Bola Atual
            </span>
            {status === 'PLAYING' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <div className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
            {currentBall !== null ? (
              <span>
                {currentLetter ? `${currentLetter} · ` : 'Número '}
                {currentBall}
              </span>
            ) : (
              <span className="text-zinc-500 text-sm font-normal">Aguardando sorteio</span>
            )}
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5 tabular-nums">
            {drawnCount} de {totalBalls} chamadas
          </div>
        </div>
      </div>

      {/* Middle: Secondary Horizontal Line for Previous Numbers (Clean & Understated) */}
      <div className="flex-1 w-full md:w-auto flex flex-col items-start overflow-hidden">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Histórico Recente
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin">
          {previousBalls.length > 0 ? (
            previousBalls.map((b, idx) => {
              const letter = mode === 'BINGO_75' ? get75BallLetter(b) : null;
              return (
                <div
                  key={`${b}-${idx}`}
                  className="h-8 px-2.5 rounded-md bg-[#202227] border border-zinc-800 text-zinc-300 flex items-center gap-1 shrink-0 font-mono text-xs font-semibold tabular-nums"
                  style={{
                    opacity: Math.max(0.4, 1 - idx * 0.12),
                  }}
                  title={letter ? `${letter}-${b}` : `Número ${b}`}
                >
                  {letter && <span className="text-[10px] text-zinc-500 font-bold">{letter}</span>}
                  <span>{b}</span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-zinc-600 font-normal py-1">
              Nenhuma bola sorteada ainda
            </span>
          )}
        </div>
      </div>

      {/* Right: Solid Contrast 'BINGO!' Button */}
      <div className="shrink-0 w-full md:w-auto">
        <button
          onClick={onClaimBingo}
          disabled={!canClaim}
          className={`w-full md:w-auto px-6 py-3.5 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all select-none ${
            canClaim
              ? 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 shadow-sm cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
          }`}
          title="Chamar Bingo para validação imediata da sua cartela"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>CHAMAR BINGO</span>
        </button>
      </div>
    </div>
  );
};
