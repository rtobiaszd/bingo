import React from 'react';
import { CardTheme, MarkerStyle } from '../types/bingo';
import { MarkerIcon } from './MarkerIcon';
import { CheckCheck } from 'lucide-react';

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
      {/* Card Header & Controls */}
      <div className="w-full flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold" role="img" aria-label="avatar">
            {avatar}
          </span>
          <span className="text-sm font-semibold text-zinc-200">{playerName}</span>
          <span className="text-xs text-zinc-500 font-mono">
            {mode === 'BINGO_75' ? 'Cartela 75' : 'Cartela 90'}
          </span>
        </div>

        {onAutoMark && (
          <button
            onClick={onAutoMark}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md bg-[#202227] border border-zinc-800 hover:border-zinc-700 transition-colors font-medium cursor-pointer"
            title="Marcar automaticamente números sorteados presentes na cartela"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Auto-Marcar</span>
          </button>
        )}
      </div>

      {/* Main Bingo Card Surface: Cantos max 8px (rounded-lg), bordas finas */}
      <div
        className={`w-full rounded-lg border p-3.5 sm:p-5 transition-all ${theme.cardBg} ${theme.cardBorder}`}
      >
        {mode === 'BINGO_75' ? (
          /* BINGO 75 Mode (5x5 Grid) */
          <div>
            {/* Letters Header */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-2.5">
              {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                <div
                  key={letter}
                  className={`py-2 rounded-md text-center font-bold text-xs sm:text-sm tracking-wider border border-transparent ${theme.headerBg} ${theme.headerText}`}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* 5x5 Cells: Espaçamento amplo, bordas finas, cantos max 8px */}
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
                      className={`h-14 sm:h-16 md:h-18 rounded-md border flex flex-col items-center justify-center relative select-none transition-all duration-100 ${
                        isFree
                          ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 font-semibold cursor-default text-xs'
                          : isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-transparent animate-cell-mark shadow-sm`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} border-emerald-500/80 hover:bg-zinc-800`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:border-zinc-700 hover:bg-zinc-800/70`
                      }`}
                    >
                      {/* Number with clean geometric typography */}
                      <span
                        className={`font-mono text-base sm:text-lg md:text-xl font-bold tracking-tight tabular-nums ${
                          isMarked ? 'opacity-95' : 'opacity-100'
                        }`}
                      >
                        {isFree ? 'LIVRE' : val}
                      </span>

                      {/* Optional minimal marker icon overlay if not full solid */}
                      {isMarked && marker.iconName !== 'fill' && (
                        <div className="absolute top-1 right-1 pointer-events-none">
                          <MarkerIcon iconName={marker.iconName} size={14} />
                        </div>
                      )}

                      {/* Subtle hint when number was drawn and awaits mark */}
                      {isPendingMark && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2 mb-2 text-center text-[10px] sm:text-xs font-mono font-medium text-zinc-500">
              {['1-9', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s'].map((colLabel) => (
                <div key={colLabel} className="truncate">
                  {colLabel}
                </div>
              ))}
            </div>

            {/* 3x9 Cells */}
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
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
                        className="h-12 sm:h-14 md:h-16 rounded-md bg-zinc-900/40 border border-zinc-800/40 flex items-center justify-center"
                      >
                        <span className="text-zinc-800 text-xs font-mono">·</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      onClick={() => onToggleCell(r, c)}
                      className={`h-12 sm:h-14 md:h-16 rounded-md border flex items-center justify-center relative select-none transition-all duration-100 ${
                        isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-transparent animate-cell-mark shadow-sm`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} border-emerald-500/80 hover:bg-zinc-800`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:border-zinc-700 hover:bg-zinc-800/70`
                      }`}
                    >
                      <span className="font-mono text-sm sm:text-base font-bold tabular-nums">
                        {val}
                      </span>

                      {isMarked && marker.iconName !== 'fill' && (
                        <div className="absolute top-1 right-1 pointer-events-none">
                          <MarkerIcon iconName={marker.iconName} size={12} />
                        </div>
                      )}

                      {isPendingMark && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
