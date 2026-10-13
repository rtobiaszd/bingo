import React, { useState } from 'react';
import { BingoMode, WinningRule } from '../types/bingo';
import { AVATARS } from '../utils/themes';
import { KeyRound, HelpCircle, ArrowRight, Dices } from 'lucide-react';

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
  const [name, setName] = useState('Jogador 1');
  const [avatar, setAvatar] = useState('👤');
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
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in py-2">
      {/* Clean Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          Bingo em Tempo Real
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Salas privadas, grade de alta legibilidade e sorteio auditado em tempo real.
        </p>
      </div>

      {/* Segmented Control Navigation (Max 8px radius) */}
      <div className="flex items-center justify-center">
        <div className="bg-[#18191e] border border-zinc-800 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Criar Sala</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Entrar com Código</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Regras</span>
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/40 text-red-200 text-xs py-2 px-3 rounded-md text-center max-w-md mx-auto">
          {errorMessage}
        </div>
      )}

      {/* Tab 1: Create Room */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleCreate}
          className="bg-[#18191e] border border-zinc-800 rounded-lg p-5 sm:p-6 shadow-sm max-w-xl mx-auto space-y-5"
        >
          {/* Player Identity */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Seu Perfil
            </label>
            <div className="flex gap-2.5 items-center">
              <div className="w-10 h-10 rounded-md bg-[#202227] border border-zinc-750 flex items-center justify-center text-xl shrink-0">
                {avatar}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome ou apelido"
                maxLength={24}
                className="flex-1 bg-[#202227] border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick avatar symbols */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors cursor-pointer ${
                    avatar === av
                      ? 'bg-emerald-500/20 border border-emerald-500 text-white'
                      : 'bg-[#202227] hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Bingo Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Formato de Jogo
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('BINGO_75')}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  mode === 'BINGO_75'
                    ? 'border-emerald-500 bg-[#202227] ring-1 ring-emerald-500/30'
                    : 'border-zinc-800 bg-[#141518] hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-xs text-zinc-100">Bingo 75 Bolas</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Grade 5x5 clássica. Linhas, diagonais e cartela cheia.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('BINGO_90')}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  mode === 'BINGO_90'
                    ? 'border-emerald-500 bg-[#202227] ring-1 ring-emerald-500/30'
                    : 'border-zinc-800 bg-[#141518] hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-xs text-zinc-100">Bingo 90 Bolas</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Cartela 3x9 tradicional com 15 números por cartela.
                </div>
              </button>
            </div>
          </div>

          {/* Winning Rule */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Critério de Vitória
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
                  className={`py-2 px-2.5 rounded-md border text-xs font-medium transition-all text-center cursor-pointer ${
                    winningRule === opt.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-zinc-800 bg-[#141518] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Draw Speed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Intervalo do Sorteio
              </label>
              <span className="font-mono text-xs text-zinc-300 tabular-nums">{speed}s por bola</span>
            </div>
            <div className="flex gap-2">
              {[3, 4, 6, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    speed === s
                      ? 'bg-zinc-700 text-white border-zinc-600'
                      : 'bg-[#141518] border-zinc-800 text-zinc-400 hover:border-zinc-700'
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
            className="w-full py-3 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Criar Sala e Gerar Código</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Tab 2: Join Room with Code */}
      {activeTab === 'join' && (
        <form
          onSubmit={handleJoin}
          className="bg-[#18191e] border border-zinc-800 rounded-lg p-5 sm:p-6 shadow-sm max-w-sm mx-auto space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Seu Nome
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-9 h-9 rounded-md bg-[#202227] border border-zinc-800 flex items-center justify-center text-lg shrink-0">
                {avatar}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome ou apelido"
                maxLength={24}
                className="flex-1 bg-[#202227] border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Código da Sala (6 dígitos)
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: 584920"
              maxLength={12}
              className="w-full bg-[#202227] border border-zinc-800 rounded-md px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors uppercase tabular-nums"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Entrar na Sala</span>
          </button>
        </form>
      )}

      {/* Tab 3: Rules & Guidance */}
      {activeTab === 'rules' && (
        <div className="bg-[#18191e] border border-zinc-800 rounded-lg p-5 sm:p-6 shadow-sm max-w-xl mx-auto space-y-4 text-zinc-300">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">Regras de Jogo</h2>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-zinc-400">
            <div>
              <h3 className="font-semibold text-zinc-200 mb-0.5">1. Sincronização em Tempo Real</h3>
              <p>
                O anfitrião inicia a partida e todos os participantes conectados na mesma sala veem as pedras sorteadas no mesmo segundo.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-200 mb-0.5">2. Modalidades 75 e 90 Bolas</h3>
              <p>
                No Bingo 75, cada coluna corresponde a uma faixa de 15 números (B: 1-15 até O: 61-75) e o centro é livre. No Bingo 90, as cartelas têm 15 números em 3 linhas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-200 mb-0.5">3. Validação Auditada</h3>
              <p>
                Ao clicar em "CHAMAR BINGO", o sistema confere se os números marcados foram legitimamente chamados no sorteio para declarar a vitória.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('create')}
            className="w-full py-2 rounded-md text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
};
