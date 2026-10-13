import React, { useState } from 'react';
import { RoomState } from '../types/bingo';
import { Copy, Check, Users, Play, Palette, Shield, Share2 } from 'lucide-react';

interface WaitingRoomViewProps {
  room: RoomState;
  currentPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onOpenCustomizer: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  room,
  currentPlayerId,
  isHost,
  onStartGame,
  onOpenCustomizer,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const url = window.location.href.split('?')[0] + `?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playersList = Object.values(room.players);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Room Welcome Header Card */}
      <div className="bg-[#18191e] border border-zinc-800 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Sala de Espera
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 font-mono">
                {room.mode === 'BINGO_75' ? 'Bingo 75 Bolas' : 'Bingo 90 Bolas'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {room.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Compartilhe o código com os participantes para sincronizar o sorteio ao vivo.
            </p>
          </div>

          {/* Room Code Box */}
          <div className="bg-[#202227] border border-zinc-800 p-3.5 rounded-lg flex flex-col items-center gap-1.5 shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Código de Acesso
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-zinc-100 tracking-widest tabular-nums">
                {room.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Copiar código"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleShareLink}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Copiar link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Players Roster & Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Players List */}
        <div className="lg:col-span-2 bg-[#18191e] border border-zinc-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Participantes na Mesa ({playersList.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {playersList.map((player) => {
              const isMe = player.id === currentPlayerId;
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-md border flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-zinc-800/60 border-zinc-700'
                      : 'bg-[#202227] border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" role="img" aria-label="avatar">
                      {player.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-200">{player.name}</span>
                        {isMe && (
                          <span className="text-[10px] text-emerald-400 font-medium">(Você)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        {player.isHost ? (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Shield className="w-3 h-3 text-emerald-400" /> Anfitrião
                          </span>
                        ) : (
                          <span>Jogador</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Launch Card */}
        <div className="bg-[#18191e] border border-zinc-800 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Sua Cartela
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Personalize cores e marcadores antes de iniciar o sorteio das pedras.
            </p>

            <button
              onClick={onOpenCustomizer}
              className="w-full py-2.5 px-3 rounded-md text-xs font-semibold text-zinc-200 bg-[#202227] hover:bg-zinc-800 border border-zinc-750 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <span>Personalizar Cartela</span>
            </button>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            {isHost ? (
              <div className="space-y-2">
                <button
                  onClick={onStartGame}
                  className="w-full py-3 px-4 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar Partida</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center">
                  O sorteio começará em ritmo automático configurado.
                </p>
              </div>
            ) : (
              <div className="text-center p-3 rounded-md bg-[#202227] border border-zinc-800">
                <p className="text-xs text-zinc-400">
                  Aguardando anfitrião iniciar a partida...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
