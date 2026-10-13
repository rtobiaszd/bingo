import React from 'react';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { WinnerAudit } from '../types/bingo';

interface WinnerCelebrationModalProps {
  winner: WinnerAudit | null;
  isHost: boolean;
  onRestartRound: () => void;
  onClose: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  winner,
  isHost,
  onRestartRound,
  onClose,
}) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/30 mb-5 animate-bounce-subtle">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
          Vitória Confirmada!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          BINGO!
        </h2>

        {/* Winner profile */}
        <div className="my-5 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center gap-3">
          <span className="text-3xl" role="img" aria-label="avatar">
            {winner.winnerAvatar}
          </span>
          <div className="text-left">
            <h3 className="text-base font-bold text-white leading-tight">
              {winner.winnerName}
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              {winner.winningPattern}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-6">
          A cartela foi auditada pelo sistema e todos os números marcados foram validados com sucesso.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {isHost ? (
            <button
              onClick={onRestartRound}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Iniciar Nova Rodada</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-xl text-xs text-zinc-400 bg-zinc-900 border border-zinc-800">
              Aguardando o anfitrião reiniciar a rodada...
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Ver Mesa de Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
