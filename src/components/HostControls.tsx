import React from 'react';
import { Play, Pause, FastForward, Clock, RotateCcw } from 'lucide-react';
import { RoomStatus } from '../types/bingo';

interface HostControlsProps {
  status: RoomStatus;
  drawSpeedSeconds: number;
  onTogglePause: () => void;
  onDrawNext: () => void;
  onSetSpeed: (sec: number) => void;
  onRestartRound: () => void;
}

export const HostControls: React.FC<HostControlsProps> = ({
  status,
  drawSpeedSeconds,
  onTogglePause,
  onDrawNext,
  onSetSpeed,
  onRestartRound,
}) => {
  const isPlaying = status === 'PLAYING';

  return (
    <div className="w-full bg-[#18191e] border border-zinc-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 transition-all">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <div>
          <span className="text-xs font-semibold text-zinc-200 block">
            Painel do Anfitrião
          </span>
          <span className="text-[11px] text-zinc-500">
            {isPlaying ? 'Sorteio em execução' : status === 'PAUSED' ? 'Em pausa' : 'Aguardando início'}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play / Pause */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            isPlaying
              ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pausar' : 'Iniciar Sorteio'}</span>
        </button>

        {/* Draw Next Single Ball */}
        <button
          onClick={onDrawNext}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#202227] border border-zinc-750 hover:border-zinc-650 text-zinc-200 hover:text-white transition-colors"
          title="Chamar próxima bola agora"
        >
          <FastForward className="w-3.5 h-3.5 text-zinc-400" />
          <span>Próxima</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-[#202227] border border-zinc-800 p-0.5 rounded-md text-xs">
          <Clock className="w-3 h-3 text-zinc-500 ml-1.5 mr-0.5" />
          {[3, 5, 8].map((sec) => (
            <button
              key={sec}
              onClick={() => onSetSpeed(sec)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                drawSpeedSeconds === sec
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Reset / New Round */}
        <button
          onClick={onRestartRound}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-transparent border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Reiniciar a rodada"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  );
};
