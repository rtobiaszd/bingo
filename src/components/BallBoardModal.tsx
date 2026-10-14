import React from 'react';
import { X, Grid3X3, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">Quadro Geral de Pedras</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-amber-300 font-bold font-game">
                  {drawnBalls.length} de {total} pedras sorteadas
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-cyan-400 font-display">
                  {total - drawnBalls.length} restantes
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin flex-1">
          {mode === 'BINGO_75' ? (
            /* 75 Mode categorized by B I N G O */
            <div className="space-y-3">
              {[
                { letter: 'B', range: [1, 15], color: 'from-blue-500 to-cyan-500' },
                { letter: 'I', range: [16, 30], color: 'from-rose-500 to-pink-500' },
                { letter: 'N', range: [31, 45], color: 'from-emerald-400 to-teal-500' },
                { letter: 'G', range: [46, 60], color: 'from-amber-400 to-orange-500' },
                { letter: 'O', range: [61, 75], color: 'from-purple-500 to-indigo-500' },
              ].map((group) => (
                <div key={group.letter} className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shrink-0 font-display shadow-md bg-gradient-to-b ${group.color}`}
                  >
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
                          className={`h-8 sm:h-9 rounded-xl flex items-center justify-center font-game text-xs sm:text-sm font-bold tabular-nums border transition-all duration-300 ${
                            isDrawn
                              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                              : 'bg-white/[0.04] text-slate-500 border-white/5'
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
            /* 90 Mode categorized by tens */
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnSet.has(num);
                return (
                  <div
                    key={num}
                    className={`h-9 sm:h-10 rounded-xl flex items-center justify-center font-game text-xs sm:text-sm font-bold tabular-nums border transition-all duration-300 ${
                      isDrawn
                        ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                        : 'bg-white/[0.04] text-slate-500 border-white/5'
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
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-display">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-sm" />
              <span>Sorteada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white/[0.08] border border-white/10" />
              <span>Pendente</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold font-display text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
