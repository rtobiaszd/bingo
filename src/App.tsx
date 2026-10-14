/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoomState, BingoMode, WinningRule } from './types/bingo';
import { multiplayerService } from './services/multiplayerService';
import { soundService } from './services/soundService';
import { CARD_THEMES, MARKER_STYLES } from './utils/themes';
import { Navbar } from './components/Navbar';
import { LobbyView } from './components/LobbyView';
import { WaitingRoomView } from './components/WaitingRoomView';
import { BingoCardView } from './components/BingoCardView';
import { BallSpinnerHUD } from './components/BallSpinnerHUD';
import { HostControls } from './components/HostControls';
import { ChatPanel } from './components/ChatPanel';
import { CustomizerModal } from './components/CustomizerModal';
import { BallBoardModal } from './components/BallBoardModal';
import { WinnerCelebrationModal } from './components/WinnerCelebrationModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isWinnerDismissed, setIsWinnerDismissed] = useState(false);

  // Audio toggles
  const [sfxActive, setSfxActive] = useState(true);
  const [speechActive, setSpeechActive] = useState(true);

  // User feedback toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check URL params on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room');
      if (code) {
        setInitialRoomCode(code.trim().toUpperCase());
      }
    }
  }, []);

  // Subscribe to multiplayer engine
  useEffect(() => {
    const unsubscribe = multiplayerService.subscribe((updatedRoom) => {
      setRoom(updatedRoom);
      setCurrentPlayerId(multiplayerService.getCurrentPlayerId());

      // If a winner just emerged, show winner modal
      if (updatedRoom.winner) {
        setIsWinnerDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Audio settings sync
  const handleToggleSfx = () => {
    const next = !sfxActive;
    setSfxActive(next);
    soundService.sfxEnabled = next;
  };

  const handleToggleSpeech = () => {
    const next = !speechActive;
    setSpeechActive(next);
    soundService.speechEnabled = next;
  };

  // Room lifecycle handlers
  const handleCreateRoom = (
    hostName: string,
    avatar: string,
    mode: BingoMode,
    rule: WinningRule,
    speed: number,
    isPrivate: boolean = false,
    roomName?: string
  ) => {
    const { room: newRoom, playerId } = multiplayerService.createRoom(
      hostName,
      avatar,
      mode,
      rule,
      speed,
      isPrivate,
      roomName
    );
    setRoom(newRoom);
    setCurrentPlayerId(playerId);
    showToast(
      isPrivate
        ? `Sala privada criada! Código de acesso: ${newRoom.code}`
        : `Sala pública aberta criada! Outros jogadores já podem entrar.`,
      'success'
    );
  };

  // Async room join with proper await and error handling
  const handleJoinRoom = async (code: string, playerName: string, avatar: string) => {
    try {
      const res = await multiplayerService.joinRoom(code, playerName, avatar);
      if (!res.success) {
        showToast(res.error || 'Erro ao entrar na sala', 'error');
        return;
      }
      if (res.room && res.playerId) {
        setRoom(res.room);
        setCurrentPlayerId(res.playerId);
        showToast('Entrou na sala com sucesso!', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Erro ao conectar à sala', 'error');
    }
  };

  const handleLeaveRoom = () => {
    multiplayerService.leaveRoom();
    setRoom(null);
    setCurrentPlayerId(null);
    showToast('Você saiu da sala.', 'info');
  };

  // Bot management
  const handleAddBot = () => {
    const success = multiplayerService.addBotPlayer();
    if (success) {
      showToast('Convidado adicionado à mesa!', 'success');
    } else {
      showToast('Não foi possível adicionar mais convidados.', 'error');
    }
  };

  const handleRemovePlayer = (id: string) => {
    multiplayerService.removePlayer(id);
    showToast('Participante removido da mesa.', 'info');
  };

  // Game control handlers
  const handleStartGame = () => {
    multiplayerService.startGame();
    showToast('Partida iniciada! O sorteio começou.', 'success');
  };

  const handleTogglePause = () => {
    multiplayerService.togglePause();
  };

  const handleDrawNext = () => {
    multiplayerService.drawNextBall();
  };

  const handleSetSpeed = (seconds: number) => {
    multiplayerService.setSpeed(seconds);
  };

  const handleRestartRound = () => {
    multiplayerService.restartRound();
    setIsWinnerDismissed(false);
    showToast('Nova rodada iniciada com cartelas limpas!', 'info');
  };

  // Player gameplay handlers
  const handleToggleCell = (row: number, col: number) => {
    multiplayerService.toggleCell(row, col);
  };

  const handleAutoMark = () => {
    multiplayerService.autoMarkDrawn();
    showToast('Pedras sorteadas marcadas automaticamente!', 'success');
  };

  const handleClaimBingo = () => {
    const res = multiplayerService.claimBingo();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSendMessage = (text: string, reaction?: string) => {
    multiplayerService.sendChatMessage(text, reaction);
  };

  const handleSaveCustomization = (themeId: string, markerId: string) => {
    multiplayerService.updateCustomization(themeId, markerId);
    showToast('Personalização da cartela aplicada!', 'success');
  };

  const handleRegenerateNumbers = () => {
    multiplayerService.regenerateCard();
    showToast('Novos números gerados para sua cartela!', 'info');
  };

  // Active player in current room
  const currentPlayer =
    room && currentPlayerId ? room.players[currentPlayerId] : null;
  const isHost = multiplayerService.isCurrentPlayerHost(room);

  const activeTheme = currentPlayer
    ? CARD_THEMES.find((t) => t.id === currentPlayer.themeId) || CARD_THEMES[0]
    : CARD_THEMES[0];
  const activeMarker = currentPlayer
    ? MARKER_STYLES.find((m) => m.id === currentPlayer.markerId) || MARKER_STYLES[0]
    : MARKER_STYLES[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070a14] via-[#0c1024] to-[#120e2e] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Immersive ambient luminous mesh */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold font-display shadow-2xl border backdrop-blur-xl transition-all ${
              toast.type === 'success'
                ? 'bg-slate-900/90 text-emerald-300 border-emerald-400/50 shadow-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-slate-900/90 text-rose-300 border-rose-400/50 shadow-rose-500/20'
                : 'bg-slate-900/90 text-slate-200 border-white/20 shadow-black/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        roomCode={room?.code}
        roomMode={room?.mode}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenBoard={() => setIsBoardOpen(true)}
        onLeaveRoom={room ? handleLeaveRoom : undefined}
        sfxActive={sfxActive}
        speechActive={speechActive}
        onToggleSfx={handleToggleSfx}
        onToggleSpeech={handleToggleSpeech}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-start relative z-10">
        {!room ? (
          /* Zero-State: Lobby View */
          <LobbyView
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            initialCode={initialRoomCode}
          />
        ) : room.status === 'WAITING' ? (
          /* Pre-Game: Waiting Room View */
          <WaitingRoomView
            room={room}
            currentPlayerId={currentPlayerId || ''}
            isHost={isHost}
            onStartGame={handleStartGame}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onAddBot={handleAddBot}
            onRemovePlayer={handleRemovePlayer}
          />
        ) : (
          /* Live Game Table View */
          <div className="w-full space-y-6">
            {/* Host floating / embedded management controls */}
            {isHost && (
              <HostControls
                status={room.status}
                drawSpeedSeconds={room.drawSpeedSeconds}
                onTogglePause={handleTogglePause}
                onDrawNext={handleDrawNext}
                onSetSpeed={handleSetSpeed}
                onRestartRound={handleRestartRound}
                onAddBot={handleAddBot}
              />
            )}

            {/* Ball Spinner & Last Calls HUD */}
            <BallSpinnerHUD
              mode={room.mode}
              status={room.status}
              currentBall={room.currentBall}
              previousBalls={room.previousBalls}
              drawnCount={room.drawnBalls.length}
              totalBalls={room.mode === 'BINGO_75' ? 75 : 90}
              onClaimBingo={handleClaimBingo}
              canClaim={room.status === 'PLAYING'}
            />

            {/* Split Arena: Bingo Card on Left / Chat on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Cols: Player's Interactive Bingo Card */}
              <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center">
                {currentPlayer && (
                  <BingoCardView
                    mode={room.mode}
                    cardNumbers={currentPlayer.cardNumbers}
                    markedCells={currentPlayer.markedCells}
                    drawnBalls={room.drawnBalls}
                    theme={activeTheme}
                    marker={activeMarker}
                    onToggleCell={handleToggleCell}
                    onAutoMark={handleAutoMark}
                    playerName={currentPlayer.name}
                    avatar={currentPlayer.avatar}
                  />
                )}
              </div>

              {/* Right 1 Col: Integrated Chat & Social Events */}
              <div className="lg:col-span-1 h-[520px]">
                <ChatPanel
                  messages={room.chat}
                  currentPlayerId={currentPlayerId || ''}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-5 px-6 text-center text-xs text-slate-400 font-display relative z-10 bg-slate-950/60 backdrop-blur-md">
        <span>Bingo Real-Time Club · Salas Privadas · 75 & 90 Bolas · Locução e Sorteio Sincronizado</span>
      </footer>

      {/* Modal: Customizer */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentThemeId={activeTheme.id}
        currentMarkerId={activeMarker.id}
        cardNumbers={currentPlayer?.cardNumbers || []}
        mode={room?.mode || 'BINGO_75'}
        isGameActive={room?.status === 'PLAYING'}
        onSaveCustomization={handleSaveCustomization}
        onRegenerateNumbers={handleRegenerateNumbers}
      />

      {/* Modal: Master Board (Quadro Geral) */}
      <BallBoardModal
        isOpen={isBoardOpen}
        onClose={() => setIsBoardOpen(false)}
        mode={room?.mode || 'BINGO_75'}
        drawnBalls={room?.drawnBalls || []}
      />

      {/* Modal: Winner Celebration */}
      {room?.winner && !isWinnerDismissed && (
        <WinnerCelebrationModal
          winner={room.winner}
          isHost={isHost}
          onRestartRound={handleRestartRound}
          onClose={() => setIsWinnerDismissed(true)}
        />
      )}

      {/* Network Connectivity Status Indicator for PWA */}
      <OfflineIndicator />
    </div>
  );
}
