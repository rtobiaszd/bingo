import React, { useState } from 'react';
import { BingoMode, WinningRule } from '../types/bingo';
import { AVATARS } from '../utils/themes';
import { Sparkles, Users, KeyRound, HelpCircle, ArrowRight, Dices, ShieldCheck } from 'lucide-react';

interface LobbyViewProps {
  onCreateRoom: (
    hostName: string,
    avatar: string,
    mode: BingoMode,
    rule: WinningRule,
    speed: number
  ) => void;
  onJoinRoom: (code: string, playerName: string, avatar: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'rules'>('create');

  // Form states
  const [name, setName] = useState('Jogador da Sorte');
  const [avatar, setAvatar] = useState('👑');
  const [mode, setMode] = useState<BingoMode>('BINGO_75');
  const [winningRule, setWinningRule] = useState<WinningRule>('ANY');
  const [speed, setSpeed] = useState<number>(4);
  const [joinCode, setJoinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido.');
      return;
    }
    onCreateRoom(name.trim(), avatar, mode, winningRule, speed);
  };

  const handleJoin = (e: React.FormEvent) => {
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
    onJoinRoom(joinCode.trim(), name.trim(), avatar);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Hero Presentation */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multiplayer em Tempo Real</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Bingo Real-Time Club
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Crie salas privadas para jogar com amigos, personalize suas cartelas ao vivo e acompanhe o sorteio automático com narração por voz e chat integrado.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Criar Sala Privada</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'join'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar com Código</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Regras</span>
          </button>
        </div>
      </div>

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs py-2.5 px-4 rounded-xl text-center max-w-md mx-auto">
          {errorMessage}
        </div>
      )}

      {/* Tab 1: Create Room */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto space-y-6"
        >
          {/* Player Identity */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Seu Perfil de Jogador
            </label>
            <div className="flex gap-3 items-center">
              {/* Avatar Selector */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl hover:border-amber-400 transition-colors"
                >
                  {avatar}
                </button>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou apelido"
                maxLength={24}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Quick avatar picker row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    avatar === av
                      ? 'bg-amber-400/20 border-2 border-amber-400 scale-110'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Bingo Mode Selector (75 or 90) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Modalidade de Bingo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('BINGO_75')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'BINGO_75'
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm text-white">Bingo 75 Bolas</div>
                <div className="text-xs text-zinc-400 mt-1">
                  Grade 5x5 com FREE central. Padrões de Linha, Coluna, 4 Cantos e Cartela Cheia.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('BINGO_90')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'BINGO_90'
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm text-white">Bingo 90 Bolas</div>
                <div className="text-xs text-zinc-400 mt-1">
                  Cartela tradicional 3x9 com 15 números. Prêmios por Linha e Bingo Completo.
                </div>
              </button>
            </div>
          </div>

          {/* Winning Condition */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Critério para Gritar Bingo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ANY', label: 'Qualquer Padrão' },
                { id: 'FULL_CARD', label: 'Cartela Cheia' },
                { id: 'LINE', label: 'Linha' },
                { id: 'CORNERS', label: 'Quatro Cantos' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWinningRule(opt.id as WinningRule)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    winningRule === opt.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
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
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Velocidade do Sorteio Automático
              </label>
              <span className="font-mono text-xs text-amber-400 font-bold">{speed} segundos</span>
            </div>
            <div className="flex gap-2">
              {[3, 4, 6, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    speed === s
                      ? 'bg-amber-400 text-zinc-950 border-amber-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {s}s / pedra
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
          >
            <span>Criar Sala e Gerar Código</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Tab 2: Join Room with Code */}
      {activeTab === 'join' && (
        <form
          onSubmit={handleJoin}
          className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto space-y-6"
        >
          {/* Player Name & Avatar */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Seu Perfil
            </label>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
                {avatar}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou apelido"
                maxLength={24}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {AVATARS.slice(0, 8).map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    avatar === av
                      ? 'bg-amber-400/20 border border-amber-400'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Digit Room Code */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Código de Acesso da Sala
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: 584920"
              maxLength={12}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-amber-400 focus:outline-none focus:border-amber-400 transition-colors uppercase"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar na Sala de Bingo</span>
          </button>
        </form>
      )}

      {/* Tab 3: Rules & Guidance */}
      {activeTab === 'rules' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto space-y-6 text-zinc-300">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Como Funciona o Bingo Real-Time</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
            <div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">1. Salas Privadas e Tempo Real</h3>
              <p className="text-zinc-400">
                O anfitrião cria uma sala e recebe um código de 6 dígitos para compartilhar com amigos. Todos os jogadores conectados na mesma sala veem as mesmas pedras sorteadas no mesmo segundo.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">2. Modalidades: 75 vs 90 Bolas</h3>
              <p className="text-zinc-400">
                <strong>Bingo 75:</strong> Grade 5x5 com colunas B (1-15), I (16-30), N (31-45), G (46-60) e O (61-75). O centro é grátis. Ganha com Linhas, Diagonais, 4 Cantos ou Cartela Cheia.
                <br />
                <strong>Bingo 90:</strong> Cartela 3x9 tradicional com 15 números. Ganha com 1 Linha ou Cartela Cheia (Full House).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">3. Personalização em Tempo Real</h3>
              <p className="text-zinc-400">
                Você pode trocar o tema visual da sua cartela (Casino Imperial, Esmeralda, Neon Vegas, Retrô, Minimal) e escolher o marcador de pedras (Carimbo, Trevo, Ficha, Estrela) a qualquer momento.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">4. Auditoria de BINGO Anti-Trapaça</h3>
              <p className="text-zinc-400">
                Ao clicar em "GRITAR BINGO!", o sistema valida matematicamente sua cartela contra o histórico legítimo de bolas sorteadas da partida antes de declarar a vitória com confetes e fanfarra.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('create')}
            className="w-full py-3 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            Voltar e Criar uma Sala
          </button>
        </div>
      )}
    </div>
  );
};
