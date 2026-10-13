import React from 'react';
import { Play, Pause, FastForward, Clock, RotateCcw, UserPlus, Crown } from 'lucide-react';
import { RoomStatus } from '../types/bingo';

interface HostControlsProps {
  status: RoomStatus;
  drawSpeedSeconds: number;
  onTogglePause: () => void;
  onDrawNext: () => void;
  onSetSpeed: (sec: number) => void;
  onAddBots: () => void;
  onRestartRound: () => void;
}

export const HostControls: React.FC<HostControlsProps> = ({
  status,
  drawSpeedSeconds,
  onTogglePause,
  onDrawNext,
  onSetSpeed,
  onAddBots,
  onRestartRound,
}) => {
  const isPlaying = status === 'PLAYING';

  return (
    <div className="w-full bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
          <Crown className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Painel do Anfitrião
          </span>
          <span className="text-[11px] text-zinc-400">
            {isPlaying ? 'Sorteio automático ativo' : status === 'PAUSED' ? 'Sorteio em pausa' : 'Aguardando ação'}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play / Pause */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isPlaying
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pausar Sorteio' : 'Iniciar / Continuar'}</span>
        </button>

        {/* Draw Next Single Ball */}
        <button
          onClick={onDrawNext}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 hover:text-white transition-colors"
          title="Sortear imediatamente a próxima pedra"
        >
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Sortear Próxima</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
          <Clock className="w-3.5 h-3.5 text-zinc-500 ml-1.5 mr-0.5" />
          {[3, 5, 8].map((sec) => (
            <button
              key={sec}
              onClick={() => onSetSpeed(sec)}
              className={`px-2 py-1 rounded-lg font-mono font-medium transition-colors ${
                drawSpeedSeconds === sec
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Add Bots */}
        <button
          onClick={onAddBots}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          title="Adicionar convidados virtuais para jogar junto"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">+ Convidados</span>
        </button>

        {/* Reset / New Round */}
        <button
          onClick={onRestartRound}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-300 transition-colors"
          title="Reiniciar a rodada com cartelas zeradas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  );
};
