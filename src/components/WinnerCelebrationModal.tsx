import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18191e] border border-zinc-800 rounded-lg w-full max-w-sm p-6 text-center shadow-xl">
        {/* Subtle Check Icon */}
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <CheckCircle2 className="w-6 h-6 stroke-[2]" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
          BINGO VALIDADO
        </span>

        <h2 className="text-xl font-bold text-zinc-100 tracking-tight mb-4">
          Rodada Encerrada
        </h2>

        {/* Winner profile card */}
        <div className="p-3.5 rounded-md bg-[#202227] border border-zinc-800 flex items-center justify-center gap-3 mb-4">
          <span className="text-xl" role="img" aria-label="avatar">
            {winner.winnerAvatar}
          </span>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
              {winner.winnerName}
            </h3>
            <p className="text-xs text-emerald-400 font-medium">
              {winner.winningPattern}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Todos os números chamados foram verificados contra o registro auditado do sorteio.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isHost ? (
            <button
              onClick={onRestartRound}
              className="w-full py-2.5 px-4 rounded-md font-semibold text-xs tracking-wide text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Iniciar Nova Rodada</span>
            </button>
          ) : (
            <div className="py-2 px-3 rounded-md text-xs text-zinc-400 bg-zinc-900 border border-zinc-800">
              Aguardando nova rodada do anfitrião...
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Fechar e Ver Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
