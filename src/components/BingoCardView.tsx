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
      {/* Card Header & Controls */}
      <div className="w-full flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="avatar">
            {avatar}
          </span>
          <span className="text-sm font-bold text-zinc-100">{playerName}</span>
          <span className="text-xs text-zinc-500 font-mono">
            {mode === 'BINGO_75' ? 'Cartela 75' : 'Cartela 90'}
          </span>
        </div>

        {onAutoMark && (
          <button
            onClick={onAutoMark}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 transition-all font-medium"
            title="Marcar automaticamente todas as pedras já sorteadas presentes nesta cartela"
          >
            <CheckCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Auto-Marcar</span>
          </button>
        )}
      </div>

      {/* Main Bingo Card Surface */}
      <div
        className={`w-full rounded-2xl border p-3 md:p-4 transition-all shadow-xl ${theme.cardBg} ${theme.cardBorder}`}
      >
        {mode === 'BINGO_75' ? (
          /* BINGO 75 Mode (5x5 Grid) */
          <div>
            {/* Letters Header */}
            <div className="grid grid-cols-5 gap-1.5 md:gap-2 mb-2">
              {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
                <div
                  key={letter}
                  className={`py-2 md:py-2.5 rounded-xl text-center font-black text-sm md:text-base tracking-wider shadow-sm ${theme.headerBg} ${theme.headerText}`}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* 5x5 Cells */}
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {cardNumbers.map((row, r) =>
                row.map((val, c) => {
                  const isFree = r === 2 && c === 2 && val === 0;
                  const isMarked = markedCells[r]?.[c] === true;
                  const isDrawn = val > 0 && drawnSet.has(val);
                  // Needs marking hint: drawn but player hasn't marked it yet
                  const isPendingMark = isDrawn && !isMarked;

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      onClick={() => onToggleCell(r, c)}
                      disabled={isFree}
                      className={`h-14 sm:h-16 md:h-18 rounded-xl border flex flex-col items-center justify-center relative select-none transition-all duration-150 group active:scale-95 ${
                        isFree
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-black cursor-default'
                          : isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-amber-500/50 shadow-inner`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} ring-2 ring-amber-400/70 animate-pulse`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:border-amber-400/40 hover:bg-zinc-800/80`
                      }`}
                    >
                      {/* Number Display */}
                      <span
                        className={`font-mono text-base md:text-lg font-bold tracking-tight ${
                          isMarked ? 'opacity-30 scale-90' : 'opacity-100'
                        }`}
                      >
                        {isFree ? 'FREE' : val}
                      </span>

                      {/* Marker Icon on Top */}
                      {isMarked && (
                        <div className="absolute inset-0 flex items-center justify-center animate-stamp pointer-events-none">
                          <MarkerIcon
                            iconName={marker.iconName}
                            color={marker.color}
                            size={mode === 'BINGO_75' ? 32 : 28}
                          />
                        </div>
                      )}

                      {/* Little indicator if drawn and waiting for mark */}
                      {isPendingMark && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
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
            <div className="grid grid-cols-9 gap-1 md:gap-1.5 mb-2 text-center text-[10px] md:text-xs font-mono font-bold text-zinc-400">
              {['1-9', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s'].map((colLabel) => (
                <div key={colLabel} className="truncate">
                  {colLabel}
                </div>
              ))}
            </div>

            {/* 3x9 Cells */}
            <div className="grid grid-cols-9 gap-1 md:gap-1.5">
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
                        className="h-12 sm:h-14 md:h-16 rounded-lg bg-zinc-950/40 border border-zinc-800/30 flex items-center justify-center"
                      >
                        <span className="text-zinc-700 text-xs">•</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      onClick={() => onToggleCell(r, c)}
                      className={`h-12 sm:h-14 md:h-16 rounded-lg border flex items-center justify-center relative select-none transition-all duration-150 active:scale-95 ${
                        isMarked
                          ? `${theme.markedBg} ${theme.markedText} border-amber-500/50 shadow-inner`
                          : isPendingMark
                          ? `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} ring-2 ring-amber-400/70 animate-pulse`
                          : `${theme.cellBg} ${theme.cellText} ${theme.cellBorder} hover:border-amber-400/40 hover:bg-zinc-800/80`
                      }`}
                    >
                      <span
                        className={`font-mono text-sm md:text-base font-bold ${
                          isMarked ? 'opacity-30 scale-90' : 'opacity-100'
                        }`}
                      >
                        {val}
                      </span>

                      {isMarked && (
                        <div className="absolute inset-0 flex items-center justify-center animate-stamp pointer-events-none">
                          <MarkerIcon iconName={marker.iconName} color={marker.color} size={24} />
                        </div>
                      )}

                      {isPendingMark && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
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
