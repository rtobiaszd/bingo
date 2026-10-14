import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Search,
  Users,
  Grid,
  Sparkles,
  X,
  Volume2,
  Send,
  CheckCircle2,
  Trophy,
  Activity,
  Flame,
  Radio,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService, FirestorePlayerCard } from '../services/firestoreService';
import { MASTER_ADMIN_EMAIL } from '../lib/firebase';
import { get75BallLetter } from '../utils/bingoRules';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomId?: string;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentRoomId,
}) => {
  const { user, isMasterAdmin, signInWithGoogle } = useAuth();
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(currentRoomId || '');
  const [roomCards, setRoomCards] = useState<FirestorePlayerCard[]>([]);
  const [adminBroadcast, setAdminBroadcast] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'PLAYING' | 'FINISHED'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Subscribe to all rooms in Firestore for Master Admin
  useEffect(() => {
    if (!isOpen || !isMasterAdmin) return;

    const unsubscribe = firestoreService.subscribeToAllRoomsForAdmin((rooms) => {
      setAllRooms(rooms);
      if (!selectedRoomId && rooms.length > 0) {
        setSelectedRoomId(rooms[0].id);
      }
    });

    return () => unsubscribe();
  }, [isOpen, isMasterAdmin, selectedRoomId]);

  // When room selected changes, keep selectedRoomId updated if passed via props
  useEffect(() => {
    if (currentRoomId) {
      setSelectedRoomId(currentRoomId);
    }
  }, [currentRoomId]);

  // Subscribe to all cards of the selected room
  useEffect(() => {
    if (!isOpen || !isMasterAdmin || !selectedRoomId) {
      setRoomCards([]);
      return;
    }

    const unsubscribe = firestoreService.subscribeToRoomCards(selectedRoomId, (cards) => {
      setRoomCards(cards);
    });

    return () => unsubscribe();
  }, [isOpen, isMasterAdmin, selectedRoomId]);

  const selectedRoom = useMemo(() => {
    return allRooms.find((r) => r.id === selectedRoomId);
  }, [allRooms, selectedRoomId]);

  const filteredRooms = useMemo(() => {
    return allRooms.filter((r) => {
      const matchesSearch =
        (r.name || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (r.code || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (r.hostName || '').toLowerCase().includes(filterSearch.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allRooms, filterSearch, statusFilter]);

  const totalPlayersAcrossRooms = useMemo(() => {
    return allRooms.reduce((acc, r) => acc + (r.playerCount || 1), 0);
  }, [allRooms]);

  const showFeedback = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Admin controls
  const handleTogglePlayPause = async () => {
    if (!selectedRoom) return;
    const newStatus = selectedRoom.status === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    await firestoreService.updateRoomState(selectedRoom.id, { status: newStatus });
    showFeedback(`Sala ${newStatus === 'PLAYING' ? 'iniciada/retomada' : 'pausada'}`);
  };

  const handleDrawManualBall = async () => {
    if (!selectedRoom) return;
    const maxBalls = selectedRoom.mode === 'BINGO_75' ? 75 : 90;
    const drawn = new Set<number>(selectedRoom.drawnBalls || []);
    const available: number[] = [];
    for (let i = 1; i <= maxBalls; i++) {
      if (!drawn.has(i)) available.push(i);
    }

    if (available.length === 0) {
      showFeedback('Todas as bolas já foram sorteadas!');
      return;
    }

    const nextBall = available[Math.floor(Math.random() * available.length)];
    const newDrawn = [...(selectedRoom.drawnBalls || []), nextBall];

    await firestoreService.updateRoomState(selectedRoom.id, {
      drawnBalls: newDrawn,
      currentBall: nextBall,
      status: selectedRoom.status === 'WAITING' ? 'PLAYING' : selectedRoom.status,
    });

    // Anunciar no chat
    const letter = selectedRoom.mode === 'BINGO_75' ? get75BallLetter(nextBall) + '-' : '';
    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'admin-draw-' + Date.now(),
      playerId: 'master-admin',
      senderName: '👑 Master Admin',
      text: `Bola sorteada manualmente: ${letter}${nextBall}`,
      timestamp: Date.now(),
      type: 'BALL_DRAWN',
    });

    showFeedback(`Bola sorteada: ${letter}${nextBall}`);
  };

  const handleRestartRoom = async () => {
    if (!selectedRoom) return;
    if (!confirm(`Tem certeza que deseja reiniciar o sorteio da sala "${selectedRoom.name}"?`)) return;

    await firestoreService.updateRoomState(selectedRoom.id, {
      drawnBalls: [],
      currentBall: undefined,
      status: 'WAITING',
      winnerId: undefined,
      winnerName: undefined,
    });

    // Limpar marcações das cartelas
    for (const card of roomCards) {
      await firestoreService.updatePlayerCard(selectedRoom.id, card.id, [], false);
    }

    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'admin-restart-' + Date.now(),
      playerId: 'master-admin',
      senderName: '👑 Master Admin',
      text: 'A rodada foi reiniciada pelo Administrador Master!',
      timestamp: Date.now(),
      type: 'ADMIN',
    });

    showFeedback('Rodada reiniciada com sucesso!');
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Deseja realmente excluir permanentemente esta sala?')) return;
    await firestoreService.deleteRoom(roomId);
    if (selectedRoomId === roomId) {
      setSelectedRoomId('');
    }
    showFeedback('Sala removida do banco de dados');
  };

  const handleSendAdminBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBroadcast.trim() || !selectedRoom) return;

    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'broadcast-' + Date.now(),
      playerId: 'master-admin',
      senderName: '👑 Master Admin',
      text: adminBroadcast.trim(),
      timestamp: Date.now(),
      type: 'ADMIN',
    });

    setAdminBroadcast('');
    showFeedback('Aviso transmitido com sucesso!');
  };

  const handleForceBingo = async (card: FirestorePlayerCard) => {
    if (!selectedRoom) return;
    if (!confirm(`Declarar vitória de Bingo oficial para o jogador "${card.playerName}"?`)) return;

    await firestoreService.adminForceBingo(selectedRoom.id, card.playerId, card.playerName);
    await firestoreService.updatePlayerCard(selectedRoom.id, card.id, card.markedNumbers, true);

    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'bingo-win-' + Date.now(),
      playerId: card.playerId,
      senderName: card.playerName,
      text: `🎉 BINGO VALIDADO PELO MASTER ADMIN para ${card.playerName}!`,
      timestamp: Date.now(),
      type: 'BINGO_CALL',
    });

    showFeedback(`Vitória validada para ${card.playerName}!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-7xl max-h-[94vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 uppercase">
                  Painel Master Admin
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  EXCLUSIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Acesso restrito para <span className="font-mono text-amber-300 font-semibold">{MASTER_ADMIN_EMAIL}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actionSuccess && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {actionSuccess}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar painel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Auth Check Banner if user is not sb4fun88@gmail.com */}
        {!isMasterAdmin ? (
          <div className="p-8 text-center flex flex-col items-center justify-center my-auto max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Acesso Restrito ao Master Admin</h3>
            <p className="text-sm text-slate-300 mb-6">
              Este dashboard contém visão de raio-X de todas as cartelas dos jogadores e controle mestre de sorteio.
              Ele é restrito exclusivamente ao e-mail{' '}
              <strong className="text-amber-400 font-mono">{MASTER_ADMIN_EMAIL}</strong>.
            </p>

            {user ? (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-full mb-6 text-left">
                <p className="text-xs text-slate-400 mb-1">Conectado atualmente como:</p>
                <p className="text-sm font-semibold text-rose-300 font-mono">{user.email || 'Usuário Anônimo'}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Por favor, faça login com a conta autorizada para prosseguir.
                </p>
              </div>
            ) : null}

            <button
              onClick={signInWithGoogle}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <Crown className="w-5 h-5" />
              Entrar com Google ({MASTER_ADMIN_EMAIL})
            </button>
          </div>
        ) : (
          /* Master Admin Authorized Content */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Top KPI Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Salas no Banco</p>
                  <p className="text-2xl font-black text-white">{allRooms.length}</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Jogadores Totais</p>
                  <p className="text-2xl font-black text-white">{totalPlayersAcrossRooms}</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Cartelas Monitoradas</p>
                  <p className="text-2xl font-black text-white">{roomCards.length}</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bolas Sorteadas</p>
                  <p className="text-2xl font-black text-white">
                    {selectedRoom?.drawnBalls?.length || 0}
                    <span className="text-xs text-slate-400 font-normal">
                      /{selectedRoom?.mode === 'BINGO_75' ? '75' : '90'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Split Screen: Left = Rooms Selector, Right = Room Manager + ALL CARDS LIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Room Selector (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Salas no Firestore ({filteredRooms.length})
                    </h3>
                  </div>

                  {/* Filter & Search */}
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou código..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                      {(['ALL', 'PLAYING', 'WAITING', 'FINISHED'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
                            statusFilter === st
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {st === 'ALL'
                            ? 'Todas'
                            : st === 'PLAYING'
                            ? 'Ao Vivo'
                            : st === 'WAITING'
                            ? 'Aguardando'
                            : 'Fim'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rooms List */}
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {filteredRooms.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        Nenhuma sala encontrada no Firestore.
                      </div>
                    ) : (
                      filteredRooms.map((r) => {
                        const isSelected = r.id === selectedRoomId;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRoomId(r.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  {r.name || 'Sala de Bingo'}
                                  {r.isPrivate && (
                                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1 rounded">
                                      Privada
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Código: <span className="font-mono text-amber-300 font-bold">{r.code}</span> •
                                  Host: {r.hostName || 'Host'}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  r.status === 'PLAYING'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                                    : r.status === 'FINISHED'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/40">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                {r.playerCount || 1} jogadores
                              </span>
                              <span className="font-semibold text-slate-300">
                                {r.mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Room Controls + All Live Cards (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                {selectedRoom ? (
                  <>
                    {/* Master Action Header for Selected Room */}
                    <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                              {selectedRoom.code}
                            </span>
                            <h3 className="text-lg font-bold text-white">{selectedRoom.name}</h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Status atual:{' '}
                            <strong className="text-amber-400 uppercase">{selectedRoom.status}</strong> • Regra:{' '}
                            <span className="text-slate-300">{selectedRoom.winningRule || 'Padrão'}</span> •
                            Velocidade: {selectedRoom.drawSpeedSeconds || 4}s
                          </p>
                        </div>

                        {/* Master Quick Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleDrawManualBall}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                            title="Sortear Próxima Bola Imediatamente"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Sortear Bola
                          </button>

                          <button
                            onClick={handleTogglePlayPause}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
                              selectedRoom.status === 'PLAYING'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                            }`}
                          >
                            {selectedRoom.status === 'PLAYING' ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Iniciar
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleRestartRoom}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-medium text-xs flex items-center gap-1.5"
                            title="Reiniciar Rodada e Limpar Bolas"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reiniciar
                          </button>

                          <button
                            onClick={() => handleDeleteRoom(selectedRoom.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-xs"
                            title="Excluir Sala do Firestore"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Ball Sequence Preview */}
                      <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-700/60">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5 text-amber-400" />
                            Bolas Sorteadas ({selectedRoom.drawnBalls?.length || 0})
                          </span>
                          {selectedRoom.currentBall && (
                            <span className="text-amber-400 font-bold">
                              Última Bola: #{selectedRoom.currentBall}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto py-1">
                          {selectedRoom.drawnBalls && selectedRoom.drawnBalls.length > 0 ? (
                            selectedRoom.drawnBalls
                              .slice(-15)
                              .reverse()
                              .map((ball: number, idx: number) => {
                                const isLatest = idx === 0;
                                return (
                                  <div
                                    key={idx}
                                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                      isLatest
                                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900 shadow-lg animate-bounce'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                                    }`}
                                  >
                                    {ball}
                                  </div>
                                );
                              })
                          ) : (
                            <span className="text-xs text-slate-500 py-1">Nenhuma bola sorteada ainda.</span>
                          )}
                        </div>
                      </div>

                      {/* Admin Announcement Bar */}
                      <form onSubmit={handleSendAdminBroadcast} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Transmitir aviso oficial como Master Admin no chat desta sala..."
                          value={adminBroadcast}
                          onChange={(e) => setAdminBroadcast(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Transmitir
                        </button>
                      </form>
                    </div>

                    {/* LIVE CARDS VIEW - O diferencial solicitado pelo usuário */}
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-amber-400" />
                          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Visão de Raio-X: Todas as Cartelas dos Jogadores ({roomCards.length})
                          </h4>
                        </div>
                        <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                          Sincronização em Tempo Real (Firestore)
                        </span>
                      </div>

                      {roomCards.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl">
                          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 font-medium">
                            Nenhuma cartela registrada nesta sala ainda.
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            As cartelas aparecerão aqui assim que os jogadores entrarem na sala.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {roomCards.map((card) => {
                            const drawnSet = new Set<number>(selectedRoom?.drawnBalls || []);
                            const markedSet = new Set<number>(card.markedNumbers || []);

                            // Calcular números faltantes para bingo completo
                            let totalCardNumbers = 0;
                            let remainingToHit = 0;

                            card.numbers.forEach((row) => {
                              row.forEach((num) => {
                                if (num !== null) {
                                  totalCardNumbers++;
                                  if (!drawnSet.has(num)) {
                                    remainingToHit++;
                                  }
                                }
                              });
                            });

                            const isAlmostBingo = remainingToHit > 0 && remainingToHit <= 3;
                            const hasAllNumbersDrawn = remainingToHit === 0;

                            return (
                              <div
                                key={card.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  card.isWinner
                                    ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20'
                                    : isAlmostBingo
                                    ? 'bg-amber-950/30 border-amber-500/70 shadow-md shadow-amber-500/10'
                                    : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                                }`}
                              >
                                {/* Card Player Header */}
                                <div className="flex items-center justify-between mb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{card.playerAvatar || '👤'}</span>
                                    <div>
                                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        {card.playerName}
                                        {card.isWinner && (
                                          <Trophy className="w-4 h-4 text-yellow-400 animate-bounce" />
                                        )}
                                      </h5>
                                      <p className="text-[11px] text-slate-400 font-mono">
                                        ID: {card.playerId.slice(0, 8)}...
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    {card.isWinner ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider">
                                        Vencedor!
                                      </span>
                                    ) : (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                          isAlmostBingo
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                            : 'bg-slate-800 text-slate-300 border-slate-700'
                                        }`}
                                      >
                                        Faltam: {remainingToHit} nº
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Mini Card Grid Preview */}
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 mb-3">
                                  {card.mode === 'BINGO_75' ? (
                                    <div className="grid grid-cols-5 gap-1 text-center">
                                      {card.numbers.map((row, rIdx) =>
                                        row.map((cell, cIdx) => {
                                          const isFree = cell === null;
                                          const isDrawn = cell !== null && drawnSet.has(cell);
                                          const isMarked = cell !== null && markedSet.has(cell);

                                          return (
                                            <div
                                              key={`${rIdx}-${cIdx}`}
                                              className={`h-7 rounded flex items-center justify-center text-xs font-bold transition-all ${
                                                isFree
                                                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                                  : isDrawn
                                                  ? 'bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-sm'
                                                  : 'bg-slate-800/80 text-slate-400'
                                              }`}
                                              title={isFree ? 'FREE' : `Número ${cell} (${isDrawn ? 'Sorteado' : 'Aguardando'})`}
                                            >
                                              {isFree ? '★' : cell}
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  ) : (
                                    /* Bingo 90 Mini Grid */
                                    <div className="grid grid-cols-9 gap-0.5 text-center">
                                      {card.numbers.map((row, rIdx) =>
                                        row.map((cell, cIdx) => {
                                          const isBlank = cell === null;
                                          const isDrawn = cell !== null && drawnSet.has(cell);
                                          return (
                                            <div
                                              key={`${rIdx}-${cIdx}`}
                                              className={`h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                                                isBlank
                                                  ? 'bg-slate-900/40 text-transparent'
                                                  : isDrawn
                                                  ? 'bg-emerald-600 text-white font-black ring-1 ring-emerald-400'
                                                  : 'bg-slate-800 text-slate-300'
                                              }`}
                                            >
                                              {isBlank ? '•' : cell}
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Master Card Action Buttons */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    Verde = sorteada
                                  </div>

                                  <button
                                    onClick={() => handleForceBingo(card)}
                                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold border border-amber-500/40 text-[11px] flex items-center gap-1 transition-all"
                                  >
                                    <Trophy className="w-3 h-3" />
                                    Declarar Bingo
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-slate-800/30 border border-slate-700/60 rounded-xl">
                    <Grid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-base text-slate-300 font-bold">Nenhuma sala selecionada</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Selecione uma sala na coluna à esquerda para gerenciar o jogo e ver todas as cartelas ao vivo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
