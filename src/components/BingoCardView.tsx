import React from 'react';
import { CardTheme, MarkerStyle } from '../types/bingo';
import { MarkerIcon } from './MarkerIcon';
import { Sparkles, CheckCheck } from 'lucide-react';

interface BingoCardViewProps {
  mode: 'BINGO_75' | 'BINGO_90';
  cardNumbers: number[][];
  markedCells: boolean[][];
  drawnBalls: number[];
  theme: CardTheme;
  marker: MarkerStyle;
  onToggleCell: (row: number, col: number) => void;
  onAutoMark?: () => void;
  playerName: string;
  avatar: string;
}

export const BingoCardView: React.FC<BingoCardViewProps> = ({
  mode,
  cardNumbers,
  markedCells,
  drawnBalls,
  theme,
  marker,
  onToggleCell,
  onAutoMark,
  playerName,
  avatar,
}) => {
  const drawnSet = new Set(drawnBalls);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Gamified Header Toolbar */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <span className="text-xl" role="img" aria-label="avatar">
              {avatar}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-display tracking-wide">
                {playerName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                {mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Clique nos números para marcar sua cartela</span>
          </div>
        </div>

        {onAutoMark && (
          <button
            onClick={onAutoMark}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 font-bold shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
            title="Marcar automaticamente números sorteados presentes na cartela"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="font-display">Auto-Marcar</span>
          </button>
        )}
      </div>

      {/* Main Bingo Card Surface: Glassmorphism + Rounded-3xl + Glow */}
      <div
        className={`w-full rounded-3xl p-4 sm:p-5 transition-all duration-300 ${theme.cardBg} ${theme.cardBorder}`}
      >
        {mode === 'BINGO_75' ? (
          /* BINGO 75 Mode (5x5 Grid) */
          <div>
            {/* Letters Header */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-3">
              {[
                { letter: 'B', color: 'from-blue-500 to-cyan-500' },
                { letter: 'I', color: 'from-rose-500 to-pink-500' },
                { letter: 'N', color: 'from-emerald-400 to-teal-500' },
                { letter: 'G', color: 'from-amber-400 to-orange-500' },
                { letter: 'O', color: 'from-purple-500 to-indigo-500' },
              ].map(({ letter, color }) => (
                <div
                  key={letter}
                  className={`py-2.5 rounded-2xl text-center font-black text-base sm:text-lg tracking-wider text-slate-950 font-display shadow-lg bg-gradient-to-b ${color}`}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* 5x5 Cells: Ample padding, rounded-2xl, large Fredoka typography */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {cardNumbers.map((row, r) =>
                row.map((val, c) => {
                  const isFree = r === 2 && c === 2 && val === 0;
                  const isMarked = markedCells[r]?.[c] === true;
                  const isDrawn = val > 0 && drawnSet.has(val);
                  const isPendingMark = isDrawn && !isMarked;

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      onClick={() => onToggleCell(r, c)}
                      disabled={isFree}
                      className={`h-15 sm:h-17 md:h-19 rounded-2xl border flex flex-col items-center justify-center relative select-none transition-all duration-200 cursor-pointer active:scale-90 ${
                        isFree
                          ? 'bg-gradient-to-tr from-amber-400/30 via-orange-500/30 to-amber-300/30 border-amber-400/50 text-amber-300 font-black shadow-inner cursor-default'
                          : isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-white/30 animate-mark-pop shadow-lg`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} border-amber-400 ring-2 ring-amber-400/50 animate-pulse`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:scale-[1.02] hover:border-cyan-400/50`
                      }`}
                    >
                      {/* Number with large rounded Fredoka typography */}
                      <span
                        className={`font-game text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${
                          isMarked ? 'scale-105' : 'text-slate-100'
                        }`}
                      >
                        {isFree ? '★ FREE' : val}
                      </span>

                      {/* Optional marker overlay badge */}
                      {isMarked && marker.iconName !== 'fill' && !isFree && (
                        <div className="absolute top-1 right-1 pointer-events-none drop-shadow-md">
                          <MarkerIcon iconName={marker.iconName} color={marker.color} size={16} />
                        </div>
                      )}

                      {/* Pulsing indicator when ball has dropped and needs marking */}
                      {isPendingMark && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* BINGO 90 Mode (3x9 Grid) */
          <div>
            {/* Column range hints header */}
            <div className="grid grid-cols-9 gap-1 sm:gap-1.5 mb-2.5 text-center text-[10px] sm:text-xs font-display font-bold text-slate-400">
              {['1-9', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s'].map((colLabel) => (
                <div key={colLabel} className="truncate">
                  {colLabel}
                </div>
              ))}
            </div>

            {/* 3x9 Cells */}
            <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
              {cardNumbers.map((row, r) =>
                row.map((val, c) => {
                  const isEmpty = val === 0;
                  const isMarked = !isEmpty && markedCells[r]?.[c] === true;
                  const isDrawn = val > 0 && drawnSet.has(val);
                  const isPendingMark = isDrawn && !isMarked;

                  if (isEmpty) {
                    return (
                      <div
                        key={`cell-empty-${r}-${c}`}
                        className="h-13 sm:h-15 md:h-17 rounded-xl bg-black/20 border border-white/[0.03] flex items-center justify-center"
                      >
                        <span className="text-white/10 text-xs font-mono">✦</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      onClick={() => onToggleCell(r, c)}
                      className={`h-13 sm:h-15 md:h-17 rounded-xl border flex items-center justify-center relative select-none transition-all duration-200 cursor-pointer active:scale-90 ${
                        isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-white/30 animate-mark-pop shadow-md`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} border-amber-400 ring-2 ring-amber-400/50 animate-pulse`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:scale-[1.03] hover:border-cyan-400/50`
                      }`}
                    >
                      <span className="font-game text-base sm:text-lg md:text-xl font-bold">
                        {val}
                      </span>

                      {isMarked && marker.iconName !== 'fill' && (
                        <div className="absolute top-1 right-1 pointer-events-none drop-shadow-sm">
                          <MarkerIcon iconName={marker.iconName} color={marker.color} size={13} />
                        </div>
                      )}

                      {isPendingMark && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
