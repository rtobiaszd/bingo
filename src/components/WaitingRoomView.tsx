import React, { useState } from 'react';
import { RoomState } from '../types/bingo';
import { Copy, Check, Users, Play, Palette, UserPlus, Shield, Share2 } from 'lucide-react';

interface WaitingRoomViewProps {
  room: RoomState;
  currentPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onAddBots: () => void;
  onOpenCustomizer: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  room,
  currentPlayerId,
  isHost,
  onStartGame,
  onAddBots,
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
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Room Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Sala de Espera
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {room.mode === 'BINGO_75' ? 'Bingo 75 Bolas' : 'Bingo 90 Bolas'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {room.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Compartilhe o código da sala com seus amigos para jogarem juntos em tempo real.
            </p>
          </div>

          {/* Room Code Card */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto shadow-inner">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Código da Sala
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-black text-amber-400 tracking-wider">
                {room.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Copiar código"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={handleShareLink}
              className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              <span>Copiar link da sala</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Players Roster & Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List (2 columns on wide) */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Participantes Conectados ({playersList.length})
              </h2>
            </div>
            {isHost && (
              <button
                onClick={onAddBots}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl transition-colors font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Convidados Virtuais</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playersList.map((player) => {
              const isMe = player.id === currentPlayerId;
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-950/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label="avatar">
                      {player.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{player.name}</span>
                        {isMe && (
                          <span className="text-[10px] text-amber-400 font-bold">(Você)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        {player.isHost ? (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Shield className="w-3 h-3" /> Anfitrião
                          </span>
                        ) : player.isBot ? (
                          <span className="text-zinc-500">Convidado</span>
                        ) : (
                          <span className="text-zinc-400">Jogador</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Launch & Customizer Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sua Cartela
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Personalize o tema de cores, marcadores de pedras e gere novos números para sua cartela antes da partida começar!
            </p>

            <button
              onClick={onOpenCustomizer}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Personalizar Minha Cartela</span>
            </button>
          </div>

          {/* Host Launch or Guest Waiting */}
          <div className="pt-4 border-t border-zinc-800">
            {isHost ? (
              <div className="space-y-2">
                <button
                  onClick={onStartGame}
                  className="w-full py-4 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-95"
                >
                  <Play className="w-4 h-4 text-zinc-950" />
                  <span>Iniciar Partida</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center">
                  O sorteio começará automaticamente após o início.
                </p>
              </div>
            ) : (
              <div className="text-center p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <p className="text-xs font-medium text-amber-400 animate-pulse">
                  Aguardando o anfitrião iniciar a partida...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
