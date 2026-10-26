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
  Gift,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Hash,
  Plus,
  Download,
  Tag,
  Database,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService, FirestorePlayerCard } from '../services/firestoreService';
import { supabaseService } from '../services/supabaseService';
import { testSupabaseConnection, SUPABASE_PROJECT_REF, SUPABASE_URL } from '../lib/supabase';
import { MASTER_ADMIN_EMAIL } from '../lib/firebase';
import { get75BallLetter } from '../utils/bingoRules';
import { RegisteredPlayer, PrizeItem } from '../types/bingo';
import { DEFAULT_PRIZES } from '../utils/prizes';
import { AVATARS } from '../utils/themes';
import { SUPABASE_SQL_SCRIPT } from '../utils/supabaseSql';

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
  const [adminTab, setAdminTab] = useState<'rooms' | 'players' | 'prizes' | 'database'>('rooms');

  // Rooms & Cards State
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(currentRoomId || '');
  const [roomCards, setRoomCards] = useState<FirestorePlayerCard[]>([]);
  const [adminBroadcast, setAdminBroadcast] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'PLAYING' | 'FINISHED'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Registered Players Directory State (10, 20, 100+ players)
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNick, setNewPlayerNick] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [newPlayerCity, setNewPlayerCity] = useState('');
  const [newPlayerLuckyNumber, setNewPlayerLuckyNumber] = useState<number>(7);
  const [newPlayerAvatar, setNewPlayerAvatar] = useState('👑');

  // Prizes State
  const [prizesList, setPrizesList] = useState<PrizeItem[]>(DEFAULT_PRIZES);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newPrizeCategory, setNewPrizeCategory] = useState('Grande Prêmio');
  const [newPrizeImage, setNewPrizeImage] = useState('');
  const [newPrizeDesc, setNewPrizeDesc] = useState('');
  const [newPrizeVal, setNewPrizeVal] = useState('R$ 999,00');
  const [newPrizeBadge, setNewPrizeBadge] = useState('🏆 BINGO CHEIO');

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

  // Subscribe to registered players
  useEffect(() => {
    if (!isOpen || !isMasterAdmin) return;
    const unsubscribe = firestoreService.subscribeToRegisteredPlayers((players) => {
      setRegisteredPlayers(players);
    });
    return () => unsubscribe();
  }, [isOpen, isMasterAdmin]);

  // Subscribe to prizes
  useEffect(() => {
    if (!isOpen || !isMasterAdmin) return;
    const unsubscribe = firestoreService.subscribeToPrizes((prizes) => {
      setPrizesList(prizes);
    });
    return () => unsubscribe();
  }, [isOpen, isMasterAdmin]);

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

  // Admin Room Controls
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

    const letter = selectedRoom.mode === 'BINGO_75' ? get75BallLetter(nextBall) + '-' : '';
    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'admin-draw-' + Date.now(),
      senderId: 'master-admin',
      senderName: '👑 Master Admin',
      text: `Bola sorteada manualmente: ${letter}${nextBall}`,
      timestamp: Date.now(),
      isSystem: true,
    });

    showFeedback(`Bola sorteada: ${letter}${nextBall}`);
  };

  const handleRestartRoom = async () => {
    if (!selectedRoom) return;
    if (!confirm(`Tem certeza que deseja reiniciar o sorteio da sala "${selectedRoom.name}"?`)) return;

    await firestoreService.updateRoomState(selectedRoom.id, {
      drawnBalls: [],
      currentBall: null,
      status: 'WAITING',
      winnerId: null,
      winnerName: null,
    });

    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'admin-restart-' + Date.now(),
      senderId: 'master-admin',
      senderName: '👑 Master Admin',
      text: 'O sorteio foi reiniciado pelo Master Admin. Cartelas limpas!',
      timestamp: Date.now(),
      isSystem: true,
    });

    showFeedback('Sala reiniciada com sucesso');
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE a sala "${selectedRoom.name}" (${selectedRoom.code})?`)) return;

    await firestoreService.deleteRoom(selectedRoom.id);
    setSelectedRoomId('');
    showFeedback('Sala excluída do Firestore');
  };

  const handleSendAdminBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !adminBroadcast.trim()) return;

    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'broadcast-' + Date.now(),
      senderId: 'master-admin',
      senderName: '👑 MASTER ADMIN',
      text: adminBroadcast.trim(),
      timestamp: Date.now(),
      isSystem: true,
    });

    setAdminBroadcast('');
    showFeedback('Alerta transmitido para todos os jogadores da sala!');
  };

  const handleForceBingo = async (card: FirestorePlayerCard) => {
    if (!selectedRoom) return;
    if (!confirm(`Declarar BINGO para "${card.playerName}" nesta sala?`)) return;

    await firestoreService.adminForceBingo(selectedRoom.id, card.playerId, card.playerName);
    await firestoreService.sendChatMessage(selectedRoom.id, {
      id: 'force-bingo-' + Date.now(),
      senderId: 'master-admin',
      senderName: '👑 Master Admin',
      text: `🏆 BINGO DECLARADO pelo Master Admin para o jogador ${card.playerName}!`,
      timestamp: Date.now(),
      isBingoCall: true,
    });

    showFeedback(`Bingo declarado para ${card.playerName}`);
  };

  const handleAssignPrizeToRoom = async (prize: PrizeItem) => {
    if (!selectedRoom) {
      alert('Selecione uma sala primeiro para vincular o prêmio.');
      return;
    }
    await firestoreService.updateRoomState(selectedRoom.id, {
      prizeId: prize.id,
      prizeTitle: prize.title,
      prizeImageUrl: prize.imageUrl,
    });
    showFeedback(`Prêmio "${prize.title}" vinculado à sala "${selectedRoom.name}"!`);
  };

  // Add new player manually from Admin
  const handleCreatePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerNick.trim()) return;

    const playerRecord: RegisteredPlayer = {
      id: 'player_adm_' + Math.random().toString(36).substring(2, 9),
      name: newPlayerName.trim(),
      nickname: newPlayerNick.trim(),
      avatar: newPlayerAvatar,
      email: newPlayerEmail.trim() || undefined,
      phone: newPlayerPhone.trim() || undefined,
      city: newPlayerCity.trim() || undefined,
      luckyNumber: Number(newPlayerLuckyNumber) || 7,
      gamesPlayed: 0,
      bingoWins: 0,
      registeredAt: new Date().toISOString(),
    };

    await firestoreService.registerPlayer(playerRecord);
    await supabaseService.savePlayer(playerRecord);
    setIsAddingPlayer(false);
    setNewPlayerName('');
    setNewPlayerNick('');
    setNewPlayerEmail('');
    setNewPlayerPhone('');
    setNewPlayerCity('');
    showFeedback(`Jogador "${playerRecord.nickname}" cadastrado e sincronizado no Supabase & Firestore!`);
  };

  // Bulk generate players (10, 20, 50) para teste de escala
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const handleGenerateMockPlayers = async (count: number) => {
    setIsGeneratingBulk(true);
    const mockNames = [
      { name: 'Lucas Oliveira', nick: 'Luquinhas', city: 'Curitiba - PR', avatar: '👑' },
      { name: 'Mariana Souza', nick: 'MariBingo', city: 'São Paulo - SP', avatar: '⭐' },
      { name: 'Gabriel Santos', nick: 'GabiSorte', city: 'Rio de Janeiro - RJ', avatar: '🔥' },
      { name: 'Juliana Lima', nick: 'JuVencedora', city: 'Belo Horizonte - MG', avatar: '🍀' },
      { name: 'Rodrigo Costa', nick: 'RodrigoShow', city: 'Florianópolis - SC', avatar: '💎' },
      { name: 'Camila Rocha', nick: 'MilaBingo', city: 'Porto Alegre - RS', avatar: '🚀' },
      { name: 'Matheus Pereira', nick: 'Theus99', city: 'Brasília - DF', avatar: '🎯' },
      { name: 'Larissa Carvalho', nick: 'LariSorte', city: 'Salvador - BA', avatar: '🦁' },
      { name: 'Bruno Ferreira', nick: 'Brunao', city: 'Fortaleza - CE', avatar: '⚡' },
      { name: 'Beatriz Alves', nick: 'BiaMega', city: 'Recife - PE', avatar: '🏆' },
      { name: 'Thiago Ribeiro', nick: 'Thiagao', city: 'Goiânia - GO', avatar: '🎩' },
      { name: 'Fernanda Martins', nick: 'FerTop', city: 'Campinas - SP', avatar: '🐺' },
      { name: 'Gustavo Barbosa', nick: 'GugaShow', city: 'Santos - SP', avatar: '👑' },
      { name: 'Aline Dias', nick: 'AlineSorte', city: 'Londrina - PR', avatar: '⭐' },
      { name: 'Rafael Gomes', nick: 'RafaBingo', city: 'Maringá - PR', avatar: '🔥' },
      { name: 'Amanda Castro', nick: 'Amandinha', city: 'Joinville - SC', avatar: '🍀' },
      { name: 'Felipe Araújo', nick: 'LipeVence', city: 'Caxias do Sul - RS', avatar: '💎' },
      { name: 'Natália Cardoso', nick: 'NatiBingo', city: 'Niterói - RJ', avatar: '🚀' },
      { name: 'Leonardo Teixeira', nick: 'LeoMaster', city: 'Vitória - ES', avatar: '🎯' },
      { name: 'Carolina Moreira', nick: 'CarolTop', city: 'Manaus - AM', avatar: '🦁' },
    ];

    try {
      let created = 0;
      for (let i = 0; i < count; i++) {
        const template = mockNames[i % mockNames.length];
        const uniqueSuffix = Math.floor(100 + Math.random() * 900);
        const playerRecord: RegisteredPlayer = {
          id: `player_mock_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          name: `${template.name} ${i >= mockNames.length ? `(${i + 1})` : ''}`.trim(),
          nickname: `${template.nick}${i >= mockNames.length ? i + 1 : ''}`,
          avatar: template.avatar,
          email: `${template.nick.toLowerCase()}${uniqueSuffix}@exemplo.com`,
          phone: `(41) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          city: template.city,
          luckyNumber: Math.floor(1 + Math.random() * 75),
          gamesPlayed: Math.floor(Math.random() * 15),
          bingoWins: Math.floor(Math.random() * 4),
          registeredAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString(),
        };

        await firestoreService.registerPlayer(playerRecord);
        await supabaseService.savePlayer(playerRecord);
        created++;
      }
      showFeedback(`🎉 ${created} novos jogadores cadastrados e sincronizados no Firestore e Supabase!`);
    } catch (e: any) {
      showFeedback(`Erro ao gerar usuários: ${e?.message || 'Tente novamente'}`);
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  // Add new prize from Admin
  const handleCreatePrizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeTitle.trim() || !newPrizeImage.trim()) return;

    const prizeRecord: PrizeItem = {
      id: 'prize_adm_' + Math.random().toString(36).substring(2, 9),
      title: newPrizeTitle.trim(),
      category: newPrizeCategory,
      imageUrl: newPrizeImage.trim(),
      description: newPrizeDesc.trim() || 'Prêmio oficial em disputa na rodada.',
      estimatedValue: newPrizeVal.trim(),
      badge: newPrizeBadge.trim(),
    };

    await firestoreService.savePrize(prizeRecord);
    setIsAddingPrize(false);
    setNewPrizeTitle('');
    setNewPrizeImage('');
    setNewPrizeDesc('');
    showFeedback(`Prêmio "${prizeRecord.title}" cadastrado com sucesso!`);
  };

  // Filtered registered players
  const filteredPlayers = registeredPlayers.filter((p) => {
    const q = playerSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    );
  });

  const handleExportPlayersCSV = () => {
    const headers = ['ID', 'Nome', 'Apelido', 'Email', 'Telefone', 'Cidade', 'NumeroSorte', 'Vitorias', 'DataCadastro'];
    const rows = registeredPlayers.map((p) => [
      p.id,
      `"${p.name || ''}"`,
      `"${p.nickname || ''}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.city || ''}"`,
      p.luckyNumber || '',
      p.bingoWins || 0,
      `"${p.registeredAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jogadores_bingo_club_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Lista de jogadores exportada com sucesso em CSV!');
  };

  // Supabase management & connection status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    checking: boolean;
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    checking: false,
    tested: false,
    success: false,
    message: 'Clique em "Testar Conexão" para verificar a resposta do banco Supabase.',
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingAllToSupabase, setIsSyncingAllToSupabase] = useState(false);

  const handleTestSupabase = async () => {
    setSupabaseStatus({
      checking: true,
      tested: false,
      success: false,
      message: 'Consultando API do Supabase...',
    });
    const res = await testSupabaseConnection();
    setSupabaseStatus({
      checking: false,
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showFeedback('Script SQL copiado com sucesso!');
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncingAllToSupabase(true);
    try {
      let count = 0;
      for (const player of registeredPlayers) {
        await supabaseService.savePlayer(player);
        count++;
      }
      for (const prize of prizesList) {
        await supabaseService.savePrize(prize);
      }
      showFeedback(`✓ ${count} jogadores e catálogo sincronizados no Supabase!`);
    } catch (e: any) {
      showFeedback(`Erro ao sincronizar: ${e?.message || 'Verifique se as tabelas existem'}`);
    } finally {
      setIsSyncingAllToSupabase(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[95vh] text-slate-100">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900 border-b border-amber-500/30 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 uppercase font-display">
                  Painel Master Admin
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
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
            <h3 className="text-xl font-bold text-slate-100 mb-2 font-display">Acesso Restrito ao Master Admin</h3>
            <p className="text-sm text-slate-300 mb-6">
              Este dashboard contém visão de raio-X de todas as cartelas dos jogadores, controle mestre de sorteio e gestão completa do banco de dados.
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
              <span>Conectar como sb4fun88@gmail.com</span>
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
                  <p className="text-xs text-slate-400 font-medium">Jogadores Cadastrados</p>
                  <p className="text-2xl font-black text-white">{registeredPlayers.length}</p>
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
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Prêmios Cadastrados</p>
                  <p className="text-2xl font-black text-white">{prizesList.length}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs for Master Admin */}
            <div className="flex border-b border-slate-700/80 gap-3 pb-1">
              <button
                onClick={() => setAdminTab('rooms')}
                className={`pb-2 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-2 ${
                  adminTab === 'rooms'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Salas & Raio-X de Cartelas</span>
              </button>

              <button
                onClick={() => setAdminTab('players')}
                className={`pb-2 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-2 ${
                  adminTab === 'players'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Jogadores Cadastrados ({registeredPlayers.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('prizes')}
                className={`pb-2 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-2 ${
                  adminTab === 'prizes'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Catálogo de Prêmios ({prizesList.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('database')}
                className={`pb-2 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-2 ${
                  adminTab === 'database'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Banco Supabase & SQL</span>
              </button>
            </div>

            {/* TAB 1: ROOMS & CARDS */}
            {adminTab === 'rooms' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Room Selector (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-display">
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
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          placeholder="Buscar por código, nome ou anfitrião..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                        {(['ALL', 'WAITING', 'PLAYING', 'FINISHED'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                              statusFilter === st
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st === 'ALL' ? 'Todas' : st === 'WAITING' ? 'Aguardando' : st === 'PLAYING' ? 'Em Jogo' : 'Finalizadas'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rooms List */}
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredRooms.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                          Nenhuma sala encontrada no Firestore.
                        </div>
                      ) : (
                        filteredRooms.map((r) => {
                          const isSelected = r.id === selectedRoomId;
                          return (
                            <button
                              key={r.id}
                              onClick={() => setSelectedRoomId(r.id)}
                              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                                  : 'bg-slate-900/60 border-slate-700/40 hover:bg-slate-900'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-amber-400 text-xs">{r.code}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      r.status === 'PLAYING'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : r.status === 'WAITING'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-200 truncate mt-0.5">{r.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">Host: {r.hostName || 'Anônimo'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {r.mode === 'BINGO_75' ? '75B' : '90B'}
                                </span>
                                <span className="text-xs text-cyan-400 font-bold flex items-center gap-1 mt-1">
                                  <Users className="w-3 h-3" />
                                  {r.playerCount || 1}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Room Details, Master Controls & ALL CARDS LIVE (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {selectedRoom ? (
                    <>
                      {/* Active Room Command Strip */}
                      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-white font-display">{selectedRoom.name}</h3>
                              <span className="font-mono text-sm px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                                {selectedRoom.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Modo: <strong className="text-cyan-400">{selectedRoom.mode}</strong> · Status:{' '}
                              <strong className="text-emerald-400">{selectedRoom.status}</strong> · Host:{' '}
                              <strong className="text-white">{selectedRoom.hostName}</strong>
                            </p>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={handleTogglePlayPause}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                                selectedRoom.status === 'PLAYING'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                            >
                              {selectedRoom.status === 'PLAYING' ? (
                                <>
                                  <Pause className="w-3.5 h-3.5" />
                                  <span>Pausar</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Iniciar/Retomar</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={handleDrawManualBall}
                              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Sortear Pedra</span>
                            </button>

                            <button
                              onClick={handleRestartRoom}
                              className="px-3 py-1.5 rounded-xl bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reiniciar</span>
                            </button>

                            <button
                              onClick={handleDeleteRoom}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                              title="Excluir permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>

                        {/* Broadcast Message to Room */}
                        <form onSubmit={handleSendAdminBroadcast} className="mt-4 flex items-center gap-2">
                          <input
                            type="text"
                            value={adminBroadcast}
                            onChange={(e) => setAdminBroadcast(e.target.value)}
                            placeholder="Anunciar mensagem oficial para o chat desta sala..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Transmitir</span>
                          </button>
                        </form>
                      </div>

                      {/* LIVE RAY-X OVERVIEW OF ALL CARDS */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-display">
                            <Eye className="w-4 h-4 text-cyan-400" />
                            Visão Raio-X: Todas as Cartelas ao Vivo ({roomCards.length})
                          </h4>
                          <span className="text-xs text-slate-400">
                            Atualizado em tempo real via Firestore
                          </span>
                        </div>

                        {roomCards.length === 0 ? (
                          <div className="p-8 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl text-xs text-slate-500">
                            Nenhuma cartela registrada nesta sala ainda.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {roomCards.map((card) => {
                              const drawnSet = new Set<number>(selectedRoom.drawnBalls || []);
                              return (
                                <div
                                  key={card.id}
                                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
                                    card.isWinner
                                      ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/20'
                                      : 'bg-slate-800/50 border-slate-700/60'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{card.playerAvatar || '⭐'}</span>
                                        <div>
                                          <p className="text-xs font-bold text-white leading-none">{card.playerName}</p>
                                          <span className="text-[10px] text-slate-400 font-mono">ID: {card.playerId.slice(0, 8)}</span>
                                        </div>
                                      </div>
                                      {card.isWinner && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                                          Vencedor
                                        </span>
                                      )}
                                    </div>

                                    {/* Mini Grid representation */}
                                    <div className="grid grid-cols-5 gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/40">
                                      {card.numbers?.map((row, rIdx) =>
                                        row?.map((num, cIdx) => {
                                          if (num === null) {
                                            return (
                                              <div
                                                key={`${rIdx}-${cIdx}`}
                                                className="aspect-square rounded flex items-center justify-center text-[10px] font-bold bg-amber-500/30 text-amber-300"
                                              >
                                                ★
                                              </div>
                                            );
                                          }
                                          const isDrawn = drawnSet.has(num);
                                          return (
                                            <div
                                              key={`${rIdx}-${cIdx}`}
                                              className={`aspect-square rounded flex items-center justify-center text-[11px] font-bold font-mono ${
                                                isDrawn
                                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                                  : 'bg-slate-800 text-slate-300'
                                              }`}
                                            >
                                              {num}
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>

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
            )}

            {/* TAB 2: REGISTERED PLAYERS DIRECTORY (10, 20, 100+ PLAYERS) */}
            {adminTab === 'players' && (
              <div className="space-y-4">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Pesquisar por nome, apelido, email, telefone ou cidade..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botões de Escala para teste de 10, 20, 50 jogadores */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">Escala:</span>
                      <button
                        type="button"
                        disabled={isGeneratingBulk}
                        onClick={() => handleGenerateMockPlayers(10)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold transition-all disabled:opacity-50"
                        title="Cadastrar 10 jogadores teste no Supabase e Firestore"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingBulk}
                        onClick={() => handleGenerateMockPlayers(20)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold transition-all disabled:opacity-50"
                        title="Cadastrar 20 jogadores teste no Supabase e Firestore"
                      >
                        +20
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingBulk}
                        onClick={() => handleGenerateMockPlayers(50)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold transition-all disabled:opacity-50"
                        title="Cadastrar 50 jogadores teste no Supabase e Firestore"
                      >
                        +50
                      </button>
                    </div>

                    <button
                      onClick={handleExportPlayersCSV}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      title="Baixar lista de jogadores em formato CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>

                    <button
                      onClick={() => setIsAddingPlayer(!isAddingPlayer)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Cadastrar Jogador</span>
                    </button>
                  </div>
                </div>

                {/* Form to add new player manually */}
                {isAddingPlayer && (
                  <form onSubmit={handleCreatePlayerSubmit} className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 font-display flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar Novo Jogador Manualmente no Firestore</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Apelido na Mesa *</label>
                        <input
                          type="text"
                          required
                          value={newPlayerNick}
                          onChange={(e) => setNewPlayerNick(e.target.value)}
                          placeholder="Ex: JoaoSorte"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Avatar</label>
                        <select
                          value={newPlayerAvatar}
                          onChange={(e) => setNewPlayerAvatar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        >
                          {AVATARS.map((av) => (
                            <option key={av} value={av}>
                              {av} Avatar
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail</label>
                        <input
                          type="email"
                          value={newPlayerEmail}
                          onChange={(e) => setNewPlayerEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">WhatsApp / Telefone</label>
                        <input
                          type="tel"
                          value={newPlayerPhone}
                          onChange={(e) => setNewPlayerPhone(e.target.value)}
                          placeholder="(41) 99999-9999"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Cidade / Estado</label>
                        <input
                          type="text"
                          value={newPlayerCity}
                          onChange={(e) => setNewPlayerCity(e.target.value)}
                          placeholder="Ex: Curitiba - PR"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPlayer(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                      >
                        Confirmar Cadastro
                      </button>
                    </div>
                  </form>
                )}

                {/* Players Table */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-700">
                        <tr>
                          <th className="p-3.5">Jogador</th>
                          <th className="p-3.5">Nome Completo</th>
                          <th className="p-3.5">Contato</th>
                          <th className="p-3.5">Cidade</th>
                          <th className="p-3.5 text-center">Nº Sorte</th>
                          <th className="p-3.5 text-center">Vitórias</th>
                          <th className="p-3.5">Data Registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {filteredPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              Nenhum jogador cadastrado encontrado.
                            </td>
                          </tr>
                        ) : (
                          filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-slate-800/60 transition-colors">
                              <td className="p-3.5 flex items-center gap-2.5">
                                <span className="text-xl">{player.avatar || '⭐'}</span>
                                <div>
                                  <p className="font-bold text-white text-xs">{player.nickname}</p>
                                  <span className="text-[10px] text-slate-500 font-mono">{player.id.slice(0, 10)}</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-slate-200 font-medium">{player.name}</td>
                              <td className="p-3.5 text-slate-300">
                                {player.email && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{player.email}</span>
                                  </div>
                                )}
                                {player.phone && (
                                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-0.5">
                                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>{player.phone}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5 text-slate-300">
                                {player.city ? (
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                    {player.city}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                                {player.luckyNumber ? `#${player.luckyNumber}` : '-'}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20 text-[11px]">
                                  {player.bingoWins || 0}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-400 text-[11px]">
                                {player.registeredAt
                                  ? new Date(player.registeredAt).toLocaleDateString('pt-BR')
                                  : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRIZES CATALOG & IMAGES */}
            {adminTab === 'prizes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Catálogo Oficial de Imagens de Prêmios</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Imagens reais exibidas aos jogadores durante o jogo e no momento da vitória
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingPrize(!isAddingPrize)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Prêmio</span>
                  </button>
                </div>

                {isAddingPrize && (
                  <form onSubmit={handleCreatePrizeSubmit} className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-400 font-display">
                      Adicionar Novo Prêmio com Imagem
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Título do Prêmio *</label>
                        <input
                          type="text"
                          required
                          value={newPrizeTitle}
                          onChange={(e) => setNewPrizeTitle(e.target.value)}
                          placeholder="Ex: Smart TV 65 polegadas"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">URL da Imagem (HTTPS) *</label>
                        <input
                          type="url"
                          required
                          value={newPrizeImage}
                          onChange={(e) => setNewPrizeImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Valor Estimado</label>
                        <input
                          type="text"
                          value={newPrizeVal}
                          onChange={(e) => setNewPrizeVal(e.target.value)}
                          placeholder="R$ 1.500,00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPrize(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                      >
                        Salvar Prêmio
                      </button>
                    </div>
                  </form>
                )}

                {/* Grid of Prizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prizesList.map((prize) => (
                    <div
                      key={prize.id}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                        <img src={prize.imageUrl} alt={prize.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 font-mono border border-amber-500/30">
                          {prize.badge || prize.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-white font-display">{prize.title}</h5>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1">{prize.description}</p>
                          {prize.estimatedValue && (
                            <p className="text-xs font-mono font-bold text-amber-400 mt-2">
                              Valor: {prize.estimatedValue}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleAssignPrizeToRoom(prize)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                            title="Vincular este prêmio à sala selecionada"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Vincular à Sala</span>
                          </button>

                          <button
                            onClick={() => firestoreService.deletePrize(prize.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Remover prêmio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SUPABASE DATABASE & SQL ACTIVATION */}
            {adminTab === 'database' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header info */}
                <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/25 shrink-0">
                      <Database className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-white font-display">
                          Conexão & Ativação do Supabase
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                          Projeto: {SUPABASE_PROJECT_REF}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl font-display leading-relaxed">
                        Para o banco de dados PostgreSQL do Supabase ficar 100% funcional, basta executar o script SQL oficial no painel do Supabase uma única vez para criar as tabelas e permissões de acesso (RLS).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={supabaseStatus.checking}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-display tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Activity className="w-4 h-4" />
                      <span>{supabaseStatus.checking ? 'Testando...' : 'Testar Conexão'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncAllToSupabase}
                      disabled={isSyncingAllToSupabase}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs font-display transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                      title="Envia todos os jogadores e prêmios do Firestore para o Supabase"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>{isSyncingAllToSupabase ? 'Sincronizando...' : 'Sincronizar Tudo'}</span>
                    </button>
                  </div>
                </div>

                {/* Connection Status Live Banner */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    supabaseStatus.tested
                      ? supabaseStatus.success
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          supabaseStatus.tested
                            ? supabaseStatus.success
                              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                              : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-bold text-xs uppercase font-mono tracking-wider">
                        Status do Banco Supabase:
                      </span>
                    </div>
                    <span className="text-[11px] font-mono opacity-80">{SUPABASE_URL}</span>
                  </div>
                  <p className="text-xs mt-2 font-display leading-relaxed">
                    {supabaseStatus.message}
                  </p>
                </div>

                {/* 3 Step Activation Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-sm">
                      1
                    </div>
                    <h5 className="text-xs font-bold text-white font-display">Abra o SQL Editor</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Acesse a aba <strong>SQL Editor</strong> dentro do painel do seu projeto no Supabase.
                    </p>
                    <a
                      href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline mt-1"
                    >
                      <span>Abrir SQL Editor no Supabase</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-sm">
                      2
                    </div>
                    <h5 className="text-xs font-bold text-white font-display">Copie o Script SQL</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Clique no botão abaixo para copiar o script completo com criação das tabelas <code className="text-amber-300">players</code> e <code className="text-amber-300">prizes</code> e regras RLS.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-sm">
                      3
                    </div>
                    <h5 className="text-xs font-bold text-white font-display">Cole e Clique em RUN</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Cole o script na janela do SQL Editor e clique no botão verde <strong>Run</strong>. Pronto! O banco estará 100% funcional.
                    </p>
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline mt-1"
                    >
                      <span>Verificar agora</span>
                    </button>
                  </div>
                </div>

                {/* SQL Code Box with 1-Click Copy */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">supabase-schema.sql</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        PostgreSQL
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copiado para o Teclado!' : 'Copiar Script SQL'}</span>
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto max-h-72 leading-relaxed selection:bg-cyan-500/30">
                    {SUPABASE_SQL_SCRIPT}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
