import React from 'react';
import { X, Grid3X3 } from 'lucide-react';
import { BingoMode } from '../types/bingo';
import { getBallColor } from '../utils/bingoRules';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quadro Geral de Pedras</h2>
              <p className="text-xs text-zinc-400 font-mono">
                {drawnBalls.length} de {total} pedras sorteadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {mode === 'BINGO_75' ? (
            /* 75 Mode categorized by B I N G O */
            <div className="space-y-3">
              {[
                { letter: 'B', range: [1, 15] },
                { letter: 'I', range: [16, 30] },
                { letter: 'N', range: [31, 45] },
                { letter: 'G', range: [46, 60] },
                { letter: 'O', range: [61, 75] },
              ].map((group) => (
                <div key={group.letter} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-amber-400 text-sm shrink-0">
                    {group.letter}
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5 flex-1">
                    {Array.from(
                      { length: group.range[1] - group.range[0] + 1 },
                      (_, i) => group.range[0] + i
                    ).map((num) => {
                      const isDrawn = drawnSet.has(num);
                      const color = getBallColor(num, 'BINGO_75');
                      return (
                        <div
                          key={num}
                          className={`h-8 sm:h-9 rounded-lg flex items-center justify-center font-mono text-xs sm:text-sm font-bold border transition-all ${
                            isDrawn
                              ? 'text-white border-white/20 shadow-sm scale-105'
                              : 'bg-zinc-950/60 text-zinc-600 border-zinc-800/80'
                          }`}
                          style={{
                            backgroundColor: isDrawn ? color : undefined,
                          }}
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
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnSet.has(num);
                const color = getBallColor(num, 'BINGO_90');
                return (
                  <div
                    key={num}
                    className={`h-9 sm:h-11 rounded-lg flex items-center justify-center font-mono text-xs sm:text-sm font-bold border transition-all ${
                      isDrawn
                        ? 'text-white border-white/20 shadow-sm scale-105'
                        : 'bg-zinc-950/60 text-zinc-600 border-zinc-800/80'
                    }`}
                    style={{
                      backgroundColor: isDrawn ? color : undefined,
                    }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
