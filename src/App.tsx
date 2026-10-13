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
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

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
    speed: number
  ) => {
    const { room: newRoom, playerId } = multiplayerService.createRoom(
      hostName,
      avatar,
      mode,
      rule,
      speed
    );
    setRoom(newRoom);
    setCurrentPlayerId(playerId);
    showToast(`Sala criada com sucesso! Código: ${newRoom.code}`, 'success');
  };

  const handleJoinRoom = (code: string, playerName: string, avatar: string) => {
    const res = multiplayerService.joinRoom(code, playerName, avatar);
    if (!res.success) {
      showToast(res.error || 'Erro ao entrar na sala', 'error');
      return;
    }
    if (res.room && res.playerId) {
      setRoom(res.room);
      setCurrentPlayerId(res.playerId);
      showToast('Entrou na sala com sucesso!', 'success');
    }
  };

  const handleLeaveRoom = () => {
    multiplayerService.leaveRoom();
    setRoom(null);
    setCurrentPlayerId(null);
    showToast('Você saiu da sala.', 'info');
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
    <div className="min-h-screen bg-[#121316] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium shadow-md border backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-[#18191e] text-emerald-300 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-[#18191e] text-red-300 border-red-500/40'
                : 'bg-[#18191e] text-zinc-200 border-zinc-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-zinc-400" />}
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-start">
        {!room ? (
          /* Zero-State: Lobby View */
          <LobbyView onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        ) : room.status === 'WAITING' ? (
          /* Pre-Game: Waiting Room View */
          <WaitingRoomView
            room={room}
            currentPlayerId={currentPlayerId || ''}
            isHost={isHost}
            onStartGame={handleStartGame}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* Left 2 Cols: Player's Interactive Bingo Card */}
              <div className="lg:col-span-2 bg-[#18191e] border border-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm flex flex-col items-center">
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
              <div className="lg:col-span-1 h-[460px]">
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
      <footer className="w-full border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-500">
        <span>Bingo Real-Time Club · Salas Privadas · Bingo 75 & 90 Bolas · Locução e Chat ao Vivo</span>
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
    </div>
  );
}
