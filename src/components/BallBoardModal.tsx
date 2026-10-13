import React from 'react';
import { X, Grid3X3 } from 'lucide-react';
import { BingoMode } from '../types/bingo';

interface BallBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: BingoMode;
  drawnBalls: number[];
}

export const BallBoardModal: React.FC<BallBoardModalProps> = ({
  isOpen,
  onClose,
  mode,
  drawnBalls,
}) => {
  if (!isOpen) return null;

  const drawnSet = new Set(drawnBalls);
  const total = mode === 'BINGO_75' ? 75 : 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18191e] border border-zinc-800 rounded-lg w-full max-w-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-800 text-zinc-300 rounded-md">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Quadro de Números</h2>
              <p className="text-xs text-zinc-400 font-mono tabular-nums">
                {drawnBalls.length} de {total} chamadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {mode === 'BINGO_75' ? (
            /* 75 Mode categorized by B I N G O */
            <div className="space-y-2.5">
              {[
                { letter: 'B', range: [1, 15] },
                { letter: 'I', range: [16, 30] },
                { letter: 'N', range: [31, 45] },
                { letter: 'G', range: [46, 60] },
                { letter: 'O', range: [61, 75] },
              ].map((group) => (
                <div key={group.letter} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-zinc-200 text-xs shrink-0 font-mono">
                    {group.letter}
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5 flex-1">
                    {Array.from(
                      { length: group.range[1] - group.range[0] + 1 },
                      (_, i) => group.range[0] + i
                    ).map((num) => {
                      const isDrawn = drawnSet.has(num);
                      return (
                        <div
                          key={num}
                          className={`h-7 sm:h-8 rounded-md flex items-center justify-center font-mono text-xs font-semibold tabular-nums border transition-all ${
                            isDrawn
                              ? 'bg-emerald-500 text-zinc-950 font-bold border-transparent'
                              : 'bg-[#202227] text-zinc-500 border-zinc-800/80'
                          }`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 90 Mode categorized by tens (1-9, 10-19, etc.) */
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnSet.has(num);
                return (
                  <div
                    key={num}
                    className={`h-8 sm:h-9 rounded-md flex items-center justify-center font-mono text-xs font-semibold tabular-nums border transition-all ${
                      isDrawn
                        ? 'bg-emerald-500 text-zinc-950 font-bold border-transparent'
                        : 'bg-[#202227] text-zinc-500 border-zinc-800/80'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#141518] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
