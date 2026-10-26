import React, { useState, useEffect, useMemo } from 'react';
import { BingoMode, WinningRule, PublicRoomSummary, PrizeItem } from '../types/bingo';
import { AVATARS } from '../utils/themes';
import { DEFAULT_PRIZES } from '../utils/prizes';
import {
  KeyRound,
  HelpCircle,
  Dices,
  Sparkles,
  Loader2,
  Users,
  Globe,
  Lock,
  RefreshCw,
  Search,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  UserPlus,
} from 'lucide-react';
import { multiplayerService } from '../services/multiplayerService';
import { PWAInstallButton } from './PWAInstallButton';

interface LobbyViewProps {
  onCreateRoom: (
    hostName: string,
    avatar: string,
    mode: BingoMode,
    rule: WinningRule,
    speed: number,
    isPrivate?: boolean,
    roomName?: string,
    prizeTitle?: string,
    prizeImageUrl?: string
  ) => void;
  onJoinRoom: (code: string, playerName: string, avatar: string) => Promise<void> | void;
  initialCode?: string;
  isConnecting?: boolean;
  onOpenRegisterModal?: () => void;
  onOpenPrizesModal?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  initialCode,
  isConnecting = false,
  onOpenRegisterModal,
  onOpenPrizesModal,
}) => {
  const [activeTab, setActiveTab] = useState<'openRooms' | 'create' | 'join' | 'rules'>(
    initialCode ? 'join' : 'openRooms'
  );

  // Profile states
  const [name, setName] = useState('Jogador da Sorte');
  const [avatar, setAvatar] = useState('👑');

  // Create room states
  const [customRoomName, setCustomRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); // default: false = Open Public Room
  const [mode, setMode] = useState<BingoMode>('BINGO_75');
  const [winningRule, setWinningRule] = useState<WinningRule>('ANY');
  const [speed, setSpeed] = useState<number>(4);
  const [selectedPrize, setSelectedPrize] = useState<PrizeItem>(DEFAULT_PRIZES[0]);

  // Join room states
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Open rooms list
  const [openRooms, setOpenRooms] = useState<PublicRoomSummary[]>([]);

  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode);
      setActiveTab('join');
    }
  }, [initialCode]);

  // Load and periodically refresh open rooms
  const refreshRooms = async () => {
    setIsRefreshing(true);
    try {
      const list = await multiplayerService.fetchOpenRooms();
      setOpenRooms(list);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    refreshRooms();
    const interval = setInterval(() => {
      const list = multiplayerService.getAvailableLocalRooms();
      setOpenRooms(list);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered open rooms based on user search
  const filteredRooms = useMemo(() => {
    if (!searchFilter.trim()) return openRooms;
    const q = searchFilter.toLowerCase();
    return openRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.hostName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.modeLabel.toLowerCase().includes(q)
    );
  }, [openRooms, searchFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido.');
      return;
    }
    setErrorMessage('');
    onCreateRoom(
      name.trim(),
      avatar,
      mode,
      winningRule,
      speed,
      isPrivate,
      customRoomName.trim() || undefined,
      selectedPrize.title,
      selectedPrize.imageUrl
    );
  };

  const handleJoin = async (codeToJoin: string) => {
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido.');
      return;
    }
    const clean = codeToJoin.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('Digite o código da sala.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onJoinRoom(clean, name.trim(), avatar);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-2 px-3 sm:px-4">
      {/* Gamified Hero Banner */}
      <div className="text-center space-y-2.5 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-widest font-display shadow-lg shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>Multiplayer em Tempo Real</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-display tracking-tight drop-shadow-xl">
          BINGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">CLUB</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-display">
          Mesas abertas com contagem de jogadores em tempo real, sorteio sincronizado com voz narradora e suporte PWA para celular e computador.
        </p>
      </div>

      {/* Gamified Segmented Control Navigation */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex flex-wrap justify-center gap-1 shadow-2xl w-full sm:w-auto">
          {/* Tab 1: Salas Abertas (Públicas) */}
          <button
            onClick={() => {
              setActiveTab('openRooms');
              setErrorMessage('');
              refreshRooms();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'openRooms'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>Salas Abertas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'openRooms'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {openRooms.length}
            </span>
          </button>

          {/* Tab 2: Criar Sala */}
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Dices className="w-4 h-4 shrink-0" />
            <span>Criar Sala</span>
          </button>

          {/* Tab 3: Entrar com Código Privado */}
          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Entrar com Código</span>
          </button>

          {/* Tab 4: Prêmios */}
          {onOpenPrizesModal && (
            <button
              onClick={onOpenPrizesModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
            >
              <Gift className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Prêmios</span>
            </button>
          )}

          {/* Tab 5: Cadastro / Jogadores */}
          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Jogadores</span>
            </button>
          )}

          {/* Tab 6: Regras */}
          <button
            onClick={() => {
              setActiveTab('rules');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Regras</span>
          </button>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs py-2.5 px-4 rounded-2xl text-center max-w-md mx-auto shadow-lg font-display animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Global Profile Bar (Shared across tabs for quick setup) */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 max-w-xl mx-auto shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 flex items-center justify-center text-2xl shadow-md shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              {avatar}
            </div>
          </div>
          <div className="flex-1 sm:hidden">
            <span className="text-[10px] uppercase font-black text-amber-300 font-display block">Seu Nick</span>
            <span className="text-xs font-bold text-white font-display truncate block">{name || 'Sem nome'}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 font-display">
            <span>Seu Nome no Jogo</span>
            <span className="text-slate-400 text-[10px]">Escolha seu avatar ao lado</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Campeão 77"
              maxLength={24}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-display focus:outline-none focus:border-amber-400 focus:bg-white/[0.08] transition-all"
            />
            {/* Quick avatar popover selector */}
            <div className="flex items-center gap-1 shrink-0">
              {AVATARS.slice(0, 5).map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform cursor-pointer ${
                    avatar === av
                      ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {onOpenRegisterModal && (
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
            title="Abrir cadastro completo de jogador"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Meu Cadastro</span>
          </button>
        )}
      </div>

      {/* Banner de Cadastro de Novos Usuários */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
            <UserPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-white font-display">
                Cadastro de Novos Usuários & Jogadores
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                100% Gratuito
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                ✓ Supabase + Firestore
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl font-display leading-relaxed">
              Cadastre seu perfil oficial com nome, foto, WhatsApp, cidade e número da sorte para entrar nas rodadas, acumular vitórias no ranking e disputar prêmios reais!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs font-display tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário</span>
            </button>
          )}
          {onOpenPrizesModal && (
            <button
              onClick={onOpenPrizesModal}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/30 text-xs font-bold font-display transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ver Galeria de Prêmios Reais"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Ver Prêmios</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SALAS ABERTAS (PÚBLICAS) COM CONTAGEM DE JOGADORES                 */}
      {/* ========================================================================= */}
      {activeTab === 'openRooms' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Top Bar with Filter & Refresh */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-display">Salas Criadas Abertas</h3>
                <p className="text-[11px] text-slate-400 font-display">
                  Salas públicas da comunidade. Escolha uma mesa e entre direto com 1 clique!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar mesa ou host..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-display focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={refreshRooms}
                disabled={isRefreshing}
                title="Atualizar lista de salas"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setActiveTab('create');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black uppercase font-display tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0 hidden sm:flex items-center gap-1.5"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Abrir Sala</span>
              </button>
            </div>
          </div>

          {/* Grid of Open Rooms */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRooms.map((room) => {
                const isPlaying = room.status === 'PLAYING';
                return (
                  <div
                    key={room.code}
                    className="group bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-xl border border-white/10 hover:border-amber-400/50 rounded-2xl p-4 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between gap-3 relative overflow-hidden"
                  >
                    {/* Top ambient highlight line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/50 via-orange-500/50 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Header row: Room name + Status pill */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-white font-display truncate group-hover:text-amber-300 transition-colors">
                            {room.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-display mt-0.5">
                            <span className="text-base">{room.hostAvatar || '👑'}</span>
                            <span className="truncate">Host: <strong>{room.hostName}</strong></span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-display tracking-wider shrink-0 ${
                            isPlaying
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPlaying ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                            }`}
                          />
                          {isPlaying ? 'Em Jogo' : 'Aguardando'}
                        </span>
                      </div>

                      {/* Room Stats Pill Chips */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-display mb-2">
                        {/* Number of players badge - highlighted */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {room.playerCount} {room.playerCount === 1 ? 'Jogador' : 'Jogadores'}
                          </span>
                        </div>

                        {/* Mode badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold">
                          <Dices className="w-3 h-3 text-amber-400" />
                          <span>{room.modeLabel}</span>
                        </div>

                        {/* Speed badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>{room.drawSpeedSeconds}s/bola</span>
                        </div>
                      </div>

                      {/* Prize Thumbnail & Title Banner */}
                      {room.prizeTitle && (
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-400/30 mb-2">
                          {room.prizeImageUrl ? (
                            <img
                              src={room.prizeImageUrl}
                              alt={room.prizeTitle}
                              className="w-9 h-9 rounded-lg object-cover border border-amber-400/40 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                              <Gift className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] uppercase font-bold text-amber-400 font-mono block">
                              Prêmio em Disputa
                            </span>
                            <p className="text-xs font-black text-white truncate font-display">
                              {room.prizeTitle}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Row: Code info & Direct Join Button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10 gap-2">
                      <div className="text-[11px] font-mono text-slate-400">
                        Código: <span className="font-bold text-amber-300">{room.code}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleJoin(room.code)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black uppercase font-display tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Entrar na Sala</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State for Open Rooms */
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400/20 to-orange-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                <Globe className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white font-display">
                  Nenhuma Sala Pública Aberta no Momento
                </h3>
                <p className="text-xs text-slate-400 font-display max-w-md mx-auto leading-relaxed">
                  As salas privadas ficam ocultas com código. Seja o primeiro a criar uma mesa pública e aberta para que outros jogadores possam entrar e disputar o Bingo!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setActiveTab('create');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase font-display tracking-widest transition-all shadow-xl shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <Dices className="w-4 h-4" />
                <span>Criar a Primeira Sala Pública</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CRIAR SALA (COM SELETOR: ABERTA / PÚBLICA vs PRIVADA COM CÓDIGO)   */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl max-w-xl mx-auto space-y-5"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">
                Configurar Nova Mesa
              </h2>
              <p className="text-[11px] text-slate-400 font-display">
                Defina o tipo da sala, regras e velocidade do sorteio
              </p>
            </div>
          </div>

          {/* Room Name (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Nome da Sala (Opcional)
            </label>
            <input
              type="text"
              value={customRoomName}
              onChange={(e) => setCustomRoomName(e.target.value)}
              placeholder={`Ex: Mesa do ${name || 'Campeão'}`}
              maxLength={30}
              className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-display focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          {/* Privacy Type Selector: Aberta vs Privada */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Privacidade da Sala
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Aberta / Pública */}
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  !isPrivate
                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !isPrivate
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white font-display">Sala Aberta (Pública)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-display mt-0.5 leading-tight">
                    Visível na lista para qualquer jogador entrar direto e ver o número de participantes.
                  </p>
                </div>
              </button>

              {/* Option 2: Privada com Código */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isPrivate
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-400/60 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isPrivate
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white font-display block">Sala Privada (Código)</span>
                  <p className="text-[11px] text-slate-400 font-display mt-0.5 leading-tight">
                    Oculta da lista pública. Só entra quem receber o código secreto de 6 dígitos.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Bingo Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Modalidade
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('BINGO_75')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  mode === 'BINGO_75'
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="font-black text-sm font-display flex items-center justify-between">
                  <span>Bingo 75</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    5x5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-display">
                  Cartela clássica americana com B-I-N-G-O e espaço central livre.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('BINGO_90')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  mode === 'BINGO_90'
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="font-black text-sm font-display flex items-center justify-between">
                  <span>Bingo 90</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    3x9
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-display">
                  Estilo europeu e brasileiro com 3 linhas de 5 números cada.
                </p>
              </button>
            </div>
          </div>

          {/* Winning Rule */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block">
              Padrão Vencedor
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ANY', label: 'Qualquer Linha / Cheia', desc: 'Primeiro a fechar linha ou cartela' },
                { id: 'FULL_CARD', label: 'Cartela Cheia', desc: 'Ganha quem marcar todos os números' },
                { id: 'LINE', label: 'Linha Simples', desc: 'Linha horizontal ou vertical completa' },
                { id: 'CORNERS', label: 'Quatro Cantos', desc: 'Os 4 vértices extremos da cartela' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setWinningRule(r.id as WinningRule)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    winningRule === r.id
                      ? 'bg-amber-400/20 border-amber-400 text-white'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs font-display">{r.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-display">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ball Spinner Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display">
                Velocidade do Sorteio
              </label>
              <span className="text-xs font-bold text-amber-400 font-display">
                {speed} segundos por bola
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-display">
              <span>Rápido (3s)</span>
              <span>Padrão (4-5s)</span>
              <span>Tranquilo (10s)</span>
            </div>
          </div>

          {/* Room Prize Selector with Real Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Prêmio em Disputa na Mesa</span>
              </label>
              <span className="text-[11px] text-slate-400 font-display">
                Exibido com foto na sala e no BINGO!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DEFAULT_PRIZES.slice(0, 4).map((prize) => {
                const isSelected = selectedPrize.id === prize.id;
                return (
                  <button
                    key={prize.id}
                    type="button"
                    onClick={() => setSelectedPrize(prize)}
                    className={`p-2 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <img
                      src={prize.imageUrl}
                      alt={prize.title}
                      className="w-full h-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-white truncate font-display">
                        {prize.title}
                      </p>
                      <p className="text-[10px] text-amber-300 font-mono font-bold">
                        {prize.estimatedValue}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl shadow-amber-500/25 border-2 border-amber-300"
          >
            <Dices className="w-4 h-4 stroke-[2.5]" />
            <span>{isPrivate ? 'CRIAR SALA PRIVADA' : 'CRIAR SALA PÚBLICA ABERTA'}</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ENTRAR COM CÓDIGO (SALAS PRIVADAS)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'join' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin(joinCode);
          }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">
                Acessar Sala com Código
              </h2>
              <p className="text-[11px] text-slate-400 font-display">
                Digite o código de 6 dígitos recebido do anfitrião
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block text-center">
              Código de Acesso
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: 584920"
              maxLength={12}
              className="w-full bg-black/40 border-2 border-amber-400/40 rounded-2xl px-4 py-3.5 text-center text-2xl sm:text-3xl font-game font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all uppercase tabular-nums"
            />
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

      {/* ========================================================================= */}
      {/* TAB 4: REGRAS                                                             */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto space-y-5 text-slate-200">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">
                Regras e Como Jogar
              </h2>
              <p className="text-[11px] text-slate-400 font-display">
                Instruções para partidas em grupo
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-display">
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <h3 className="font-bold text-amber-300 text-sm mb-0.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>1. Salas Abertas vs Salas Privadas</span>
              </h3>
              <p>
                Salas Abertas ficam listadas publicamente com a contagem de jogadores em tempo real, permitindo que novos participantes entrem com apenas 1 clique. Já as salas privadas só podem ser acessadas por quem possuir o código de 6 dígitos.
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <h3 className="font-bold text-cyan-300 text-sm mb-0.5 flex items-center gap-1.5">
                <Dices className="w-4 h-4" />
                <span>2. Bingo 75 e Bingo 90</span>
              </h3>
              <p>
                No Bingo 75, cada coluna corresponde a uma letra (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75) e o centro é livre. No Bingo 90, as cartelas possuem 15 números em 3 linhas de 5.
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <h3 className="font-bold text-emerald-300 text-sm mb-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Auditoria Matemática de Vitória</span>
              </h3>
              <p>
                Ao clicar no botão "Gritar BINGO!", o sistema valida matematicamente todos os números marcados na sua cartela contra o histórico oficial de pedras sorteadas, disparando a celebração com confetes para toda a sala.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('openRooms')}
            className="w-full py-3 rounded-2xl text-xs font-black uppercase font-display text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-colors cursor-pointer shadow-md"
          >
            Ver Salas Abertas
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" className="max-w-4xl mx-auto" />
    </div>
  );
};
