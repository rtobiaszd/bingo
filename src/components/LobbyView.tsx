import React, { useState, useEffect } from 'react';
import { BingoMode, WinningRule } from '../types/bingo';
import { AVATARS } from '../utils/themes';
import { KeyRound, HelpCircle, ArrowRight, Dices, Sparkles, Loader2, Users } from 'lucide-react';
import { multiplayerService } from '../services/multiplayerService';

interface LobbyViewProps {
  onCreateRoom: (
    hostName: string,
    avatar: string,
    mode: BingoMode,
    rule: WinningRule,
    speed: number
  ) => void;
  onJoinRoom: (code: string, playerName: string, avatar: string) => Promise<void> | void;
  initialCode?: string;
  isConnecting?: boolean;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onCreateRoom, onJoinRoom, initialCode }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'rules'>(initialCode ? 'join' : 'create');

  // Form states
  const [name, setName] = useState('Jogador da Sorte');
  const [avatar, setAvatar] = useState('👑');
  const [mode, setMode] = useState<BingoMode>('BINGO_75');
  const [winningRule, setWinningRule] = useState<WinningRule>('ANY');
  const [speed, setSpeed] = useState<number>(4);
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<
    { id: string; code: string; name: string; mode: string; playerCount: number; status: string }[]
  >([]);

  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode);
      setActiveTab('join');
    }
  }, [initialCode]);

  useEffect(() => {
    const checkRooms = () => {
      const list = multiplayerService.getAvailableLocalRooms();
      setAvailableRooms(list);
    };
    checkRooms();
    const interval = setInterval(checkRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, digite seu nome ou apelido.');
      return;
    }
    onCreateRoom(name.trim(), avatar, mode, winningRule, speed);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido.');
      return;
    }
    if (!joinCode.trim()) {
      setErrorMessage('Digite o código de 6 dígitos da sala.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onJoinRoom(joinCode.trim(), name.trim(), avatar);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-7 animate-fade-in py-4">
      {/* Gamified Hero Banner */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest font-display shadow-lg shadow-amber-500/10">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Multiplayer em Tempo Real</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-display tracking-tight drop-shadow-lg">
          BINGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">CLUB</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-display">
          Salas privadas para jogar com amigos em qualquer dispositivo, globo automático sincronizado e cartelas personalizadas.
        </p>
      </div>

      {/* Gamified Segmented Control Navigation */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1.5 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Criar Sala</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar com Código</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Regras</span>
          </button>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs py-2.5 px-4 rounded-2xl text-center max-w-md mx-auto shadow-lg font-display">
          {errorMessage}
        </div>
      )}

      {/* Tab 1: Create Room */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto space-y-6"
        >
          {/* Player Identity */}
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Seu Perfil
            </label>
            <div className="flex gap-3 items-center">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 flex items-center justify-center text-3xl shadow-lg shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  {avatar}
                </div>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome no jogo"
                maxLength={24}
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 font-display focus:outline-none focus:border-amber-400 focus:bg-white/[0.1] transition-all shadow-inner"
              />
            </div>

            {/* Quick avatar selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform cursor-pointer ${
                    avatar === av
                      ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-md'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Bingo Mode Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Modalidade da Partida
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('BINGO_75')}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                  mode === 'BINGO_75'
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div className="font-black text-sm text-white font-display">Bingo 75 Bolas</div>
                <div className="text-xs text-slate-300 mt-1 leading-snug">
                  Grade 5x5 tradicional com centro livre e padrões de linha ou diagonal.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('BINGO_90')}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                  mode === 'BINGO_90'
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div className="font-black text-sm text-white font-display">Bingo 90 Bolas</div>
                <div className="text-xs text-slate-300 mt-1 leading-snug">
                  Cartela 3x9 tradicional com 15 números por cartela e prêmio por linha.
                </div>
              </button>
            </div>
          </div>

          {/* Winning Rule */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Padrão para Gritar Bingo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ANY', label: 'Qualquer Padrão' },
                { id: 'FULL_CARD', label: 'Cartela Cheia' },
                { id: 'LINE', label: 'Linha' },
                { id: 'CORNERS', label: '4 Cantos' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWinningRule(opt.id as WinningRule)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer font-display ${
                    winningRule === opt.id
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Draw Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display">
                Velocidade do Sorteio
              </label>
              <span className="font-game text-sm text-amber-400 font-bold">{speed}s por pedra</span>
            </div>
            <div className="flex gap-2">
              {[3, 4, 6, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-game font-bold border transition-all cursor-pointer ${
                    speed === s
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 cursor-pointer active:scale-95 border-2 border-amber-300"
          >
            <span>CRIAR SALA PRIVADA</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      )}

      {/* Tab 2: Join Room with Code */}
      {activeTab === 'join' && (
        <form
          onSubmit={handleJoin}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto space-y-5"
        >
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Seu Nome de Jogador
            </label>
            <div className="flex gap-2.5 items-center">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 flex items-center justify-center text-2xl shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  {avatar}
                </div>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu apelido"
                maxLength={24}
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-all font-display"
              />
            </div>
          </div>

          {/* Quick Connect: Local active rooms */}
          {availableRooms.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-amber-500/10 border border-amber-400/30">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest font-display flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mesas Ativas Encontradas ({availableRooms.length})</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                {availableRooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-amber-400/50 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white font-display truncate">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Código: <span className="text-amber-300 font-bold">{r.code}</span> · {r.mode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setJoinCode(r.code);
                        onJoinRoom(r.code, name.trim() || 'Jogador', avatar);
                      }}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-[11px] font-black font-display uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      Entrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Código de Acesso da Sala
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: 584920"
              maxLength={12}
              className="w-full bg-black/40 border border-amber-400/40 rounded-2xl px-4 py-3 text-center text-2xl font-game font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all uppercase tabular-nums"
            />
            <p className="text-[11px] text-slate-400 text-center font-display">
              Insira o código de 6 dígitos compartilhado pelo anfitrião.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl shadow-amber-500/25 border-2 border-amber-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CONECTANDO À MESA...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>ENTRAR NA SALA</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab 3: Rules & Guidance */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto space-y-5 text-slate-200">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">Regras de Jogo</h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-display">
            <div>
              <h3 className="font-bold text-amber-300 text-sm mb-0.5">1. Sincronização em Tempo Real</h3>
              <p>
                O anfitrião inicia a partida e todos os participantes conectados na mesma sala veem as pedras sorteadas no mesmo segundo através de sincronização WebRTC.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-cyan-300 text-sm mb-0.5">2. Modalidades 75 e 90 Bolas</h3>
              <p>
                No Bingo 75, cada coluna corresponde a uma faixa de 15 números (B: 1-15 até O: 61-75) e o centro é livre. No Bingo 90, as cartelas têm 15 números distribuídos em 3 linhas.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-emerald-300 text-sm mb-0.5">3. Auditoria de Vitória</h3>
              <p>
                Ao clicar em "GRITAR BINGO!", o sistema valida matematicamente todos os números marcados contra o histórico oficial do sorteio para coroar o campeão!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('create')}
            className="w-full py-3 rounded-2xl text-xs font-black uppercase font-display text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
          >
            Voltar e Jogar
          </button>
        </div>
      )}
    </div>
  );
};
