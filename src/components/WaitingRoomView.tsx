import React, { useState } from 'react';
import { RoomState } from '../types/bingo';
import { Copy, Check, Users, Play, Palette, Shield, Share2, Sparkles, UserPlus, X } from 'lucide-react';

interface WaitingRoomViewProps {
  room: RoomState;
  currentPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onOpenCustomizer: () => void;
  onAddBot?: () => void;
  onRemovePlayer?: (playerId: string) => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  room,
  currentPlayerId,
  isHost,
  onStartGame,
  onOpenCustomizer,
  onAddBot,
  onRemovePlayer,
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
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      {/* Room Welcome Header Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 font-display shadow-sm">
                Sala de Espera
              </span>
              <span className="text-xs text-cyan-300 font-bold font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                {room.mode === 'BINGO_75' ? 'Bingo 75 Bolas' : 'Bingo 90 Bolas'}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  room.isPrivate
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <span>{room.isPrivate ? '🔒 Sala Privada' : '🌐 Sala Aberta (Pública)'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
              {room.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
              {room.isPrivate
                ? 'Compartilhe o código de acesso abaixo com quem você desejar convidar para esta mesa privada.'
                : 'Esta mesa está aberta e visível na lista pública para qualquer jogador entrar direto!'}
            </p>
          </div>

          {/* Gamified Room Code Box */}
          <div className="bg-black/40 border border-amber-400/40 p-4 rounded-3xl flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto shadow-xl shadow-amber-500/10">
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest font-display">
              Código da Sala
            </span>
            <div className="flex items-center gap-3">
              <span className="font-game text-3xl sm:text-4xl font-bold text-white tracking-widest tabular-nums drop-shadow">
                {room.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-md"
                title="Copiar código da sala"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={handleShareLink}
              className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors font-display font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copiar link direto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prize Showcase Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/10 border border-amber-400/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={room.prizeImageUrl || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
            alt={room.prizeTitle || 'Prêmio Bingo'}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md shrink-0"
          />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-display px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30">
              🎁 PRÊMIO EM DISPUTA NESTA MESA
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-display mt-1">
              {room.prizeTitle || 'Smart TV 55" 4K Crystal UHD'}
            </h3>
            <p className="text-xs text-slate-300">
              O jogador que bater o Bingo primeiro levará o prêmio da rodada!
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
            Troféu & Premiação
          </span>
        </div>
      </div>

      {/* Grid: Players Roster & Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider font-display">
                Jogadores na Mesa ({playersList.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isHost && onAddBot && (
                <button
                  onClick={onAddBot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-white text-xs font-bold font-display cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Adicionar participante simulado para jogar junto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Convidado</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-display hidden sm:inline">
                Aguardando início
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playersList.map((player) => {
              const isMe = player.id === currentPlayerId;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-400/40 shadow-md'
                      : 'bg-white/[0.04] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label="avatar">
                      {player.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-display">{player.name}</span>
                        {isMe && (
                          <span className="text-[10px] text-amber-300 font-black uppercase font-display bg-amber-400/20 px-1.5 py-0.2 rounded">
                            Você
                          </span>
                        )}
                        {player.isBot && (
                          <span className="text-[9px] text-cyan-300 font-bold uppercase font-display bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-500/30">
                            Bot
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        {player.isHost ? (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold font-display">
                            <Shield className="w-3 h-3 text-amber-400" /> Anfitrião da Sala
                          </span>
                        ) : (
                          <span className="font-display">Pronto para jogar</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isHost && player.isBot && onRemovePlayer && (
                    <button
                      onClick={() => onRemovePlayer(player.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remover participante"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Launch Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
              Visual da sua Cartela
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Troque cores, temas com efeitos de vidro e escolha o marcador da sua sorte antes de girar o globo!
            </p>

            <button
              onClick={onOpenCustomizer}
              className="w-full py-3 px-4 rounded-2xl text-xs font-bold font-display text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Personalizar Cartela</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10">
            {isHost ? (
              <div className="space-y-2.5">
                <button
                  onClick={onStartGame}
                  className="w-full py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-widest font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer active:scale-95 border-2 border-amber-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>INICIAR PARTIDA</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center font-display">
                  O sorteio automático de pedras começará imediatamente.
                </p>
              </div>
            ) : (
              <div className="text-center p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-xs text-amber-300 font-display font-bold animate-pulse">
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
