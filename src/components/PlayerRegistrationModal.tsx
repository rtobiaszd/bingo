import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  User,
  Users,
  Trophy,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  X,
  CheckCircle2,
  Search,
  Hash,
  ShieldCheck,
  Flame,
  Award,
  LogIn,
} from 'lucide-react';
import { RegisteredPlayer } from '../types/bingo';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../utils/themes';

interface PlayerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerRegistered?: (player: RegisteredPlayer) => void;
}

export const PlayerRegistrationModal: React.FC<PlayerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onPlayerRegistered,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'directory'>('register');

  // Form states
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [luckyNumber, setLuckyNumber] = useState<number>(7);
  const [avatar, setAvatar] = useState('👑');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Directory of registered players
  const [playersList, setPlayersList] = useState<RegisteredPlayer[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Load existing player from localStorage or Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bingo_current_player');
      if (saved) {
        try {
          const parsed: RegisteredPlayer = JSON.parse(saved);
          setName(parsed.name || '');
          setNickname(parsed.nickname || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setCity(parsed.city || '');
          setLuckyNumber(parsed.luckyNumber || 7);
          setAvatar(parsed.avatar || '👑');
        } catch (e) {
          console.warn('Error reading player from localStorage', e);
        }
      }
    }
  }, [isOpen]);

  // If user signs in with Google, auto-populate name and email
  useEffect(() => {
    if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!nickname && user.displayName) setNickname(user.displayName.split(' ')[0]);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Subscribe to players directory from Firestore
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = firestoreService.subscribeToRegisteredPlayers((list) => {
      setPlayersList(list);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nickname.trim()) {
      alert('Por favor, informe seu Nome e Apelido para o cadastro.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const playerId = user?.uid || 'player_' + Math.random().toString(36).substring(2, 9);
      const playerRecord: RegisteredPlayer = {
        id: playerId,
        name: name.trim(),
        nickname: nickname.trim(),
        avatar,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        luckyNumber: Number(luckyNumber) || 7,
        gamesPlayed: 0,
        bingoWins: 0,
        registeredAt: new Date().toISOString(),
        isGoogleAuth: !!user,
      };

      await firestoreService.registerPlayer(playerRecord);

      // Atualiza também nome de jogador padrão no multiplayer
      if (typeof window !== 'undefined') {
        localStorage.setItem('bingo_player_name', nickname.trim());
        localStorage.setItem('bingo_player_avatar', avatar);
      }

      if (onPlayerRegistered) {
        onPlayerRegistered(playerRecord);
      }

      setSuccessMessage('🎉 Cadastro realizado com sucesso! Seus dados foram salvos no clube.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      alert('Erro ao salvar cadastro: ' + (err?.message || 'Tente novamente'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPlayers = playersList.filter((p) => {
    const q = searchFilter.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-[#0b1022] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Header */}
        <div className="relative p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                <span>Cadastro de Jogadores</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Bingo Club
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cadastre seu perfil oficial, número da sorte e acompanhe seu histórico
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Cadastro vs Comunidade */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Meu Cadastro / Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 px-3 text-xs font-bold font-display transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Comunidade de Jogadores ({playersList.length})</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'register' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Google Fast Sync Banner */}
              {!user ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Vincular Conta Google</p>
                      <p className="text-[11px] text-slate-400">Preencha seus dados com 1 clique e garanta seu histórico</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-300 font-bold">Conectado como {user.email}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Conta Autenticada</span>
                </div>
              )}

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 font-display mb-2">
                  Escolha o Avatar do Jogador:
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                        avatar === av
                          ? 'bg-amber-500/25 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nome Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria dos Santos"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Apelido na Mesa (Nickname) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: MariaDaSorte"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>E-mail</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp / Telefone</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(41) 99999-9999"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cidade / Estado</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Curitiba - PR"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-display mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>Número da Sorte (1 a 90)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={luckyNumber}
                    onChange={(e) => setLuckyNumber(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono font-bold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-display tracking-wide shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Salvar Cadastro de Jogador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Directory / Community Tab */
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Pesquisar jogadores por nome, apelido ou cidade..."
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredPlayers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Nenhum jogador encontrado. Seja o primeiro a se cadastrar!
                  </div>
                ) : (
                  filteredPlayers.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-white/10">
                          {p.avatar || '⭐'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{p.nickname}</span>
                            {p.city && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                                {p.city}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{p.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        {p.luckyNumber && (
                          <div className="hidden sm:block">
                            <p className="text-[10px] text-slate-500 uppercase font-mono">Nº da Sorte</p>
                            <p className="text-xs font-black text-amber-400 font-mono">#{p.luckyNumber}</p>
                          </div>
                        )}

                        <div className="px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center gap-1.5 text-xs font-bold">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{p.bingoWins || 0} vitórias</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
