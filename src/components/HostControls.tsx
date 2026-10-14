import React from 'react';
import { Play, Pause, FastForward, Clock, RotateCcw, Crown } from 'lucide-react';
import { RoomStatus } from '../types/bingo';

interface HostControlsProps {
  status: RoomStatus;
  drawSpeedSeconds: number;
  onTogglePause: () => void;
  onDrawNext: () => void;
  onSetSpeed: (sec: number) => void;
  onRestartRound: () => void;
  onAddBot?: () => void;
}

export const HostControls: React.FC<HostControlsProps> = ({
  status,
  drawSpeedSeconds,
  onTogglePause,
  onDrawNext,
  onSetSpeed,
  onRestartRound,
  onAddBot,
}) => {
  const isPlaying = status === 'PLAYING';

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
      {/* Label */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-display block">
            Mesa do Anfitrião
          </span>
          <span className="text-[11px] text-slate-400">
            {isPlaying ? 'Sorteio automático em andamento' : status === 'PAUSED' ? 'Sorteio em pausa' : 'Aguardando início'}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Play / Pause */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-display transition-all duration-300 shadow-lg cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'Pausar Globo' : 'Girar Globo'}</span>
        </button>

        {/* Draw Next Single Ball */}
        <button
          onClick={onDrawNext}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-300 font-display cursor-pointer active:scale-95"
          title="Chamar próxima pedra imediatamente"
        >
          <FastForward className="w-4 h-4 text-cyan-400" />
          <span>Sortear Próxima</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {[3, 5, 8].map((sec) => (
            <button
              key={sec}
              onClick={() => onSetSpeed(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-game font-bold transition-all cursor-pointer ${
                drawSpeedSeconds === sec
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Add Bot Guest */}
        {onAddBot && (
          <button
            onClick={onAddBot}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-300 transition-all duration-300 font-display cursor-pointer active:scale-95 shadow-sm"
            title="Adicionar participante simulado à mesa"
          >
            <span>+ Convidado</span>
          </button>
        )}

        {/* Reset / New Round */}
        <button
          onClick={onRestartRound}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-all duration-300 font-display cursor-pointer"
          title="Reiniciar a rodada com cartelas zeradas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  );
};
