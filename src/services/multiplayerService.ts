import { BingoMode, ChatMessage, PlayerProfile, RoomState, WinningRule } from '../types/bingo';
import { generate75Card, generate90Card, checkVictory, get75BallLetter } from '../utils/bingoRules';
import { soundService } from './soundService';
import { fireBingoConfetti } from '../utils/confetti';

const STORAGE_KEY_PREFIX = 'bingo_room_';
const CHANNEL_NAME = 'bingo_club_realtime_bus';

export type RoomEventListener = (room: RoomState) => void;

class MultiplayerService {
  private channel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private currentPlayerId: string | null = null;
  private listeners: Set<RoomEventListener> = new Set();
  private autoDrawTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'ROOM_UPDATE' && payload && payload.id === this.currentRoomId) {
          this.handleIncomingRoom(payload, false);
        }
      };

      // Also listen to storage events for cross-tab sync fallback
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_KEY_PREFIX) && e.newValue) {
          try {
            const updatedRoom = JSON.parse(e.newValue) as RoomState;
            if (updatedRoom.id === this.currentRoomId) {
              this.handleIncomingRoom(updatedRoom, false);
            }
          } catch {
            // parse error
          }
        }
      });
    }
  }

  public subscribe(listener: RoomEventListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately if present
    if (this.currentRoomId) {
      const room = this.getRoom(this.currentRoomId);
      if (room) listener(room);
    }
    return () => this.listeners.delete(listener);
  }

  private notify(room: RoomState) {
    this.listeners.forEach((l) => l(room));
  }

  public getRoom(roomId: string): RoomState | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + roomId);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RoomState;
    } catch {
      return null;
    }
  }

  public findRoomByCode(code: string): RoomState | null {
    if (typeof window === 'undefined') return null;
    const cleanCode = code.trim().toUpperCase();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const room = JSON.parse(localStorage.getItem(key)!) as RoomState;
          if (room.code === cleanCode) {
            return room;
          }
        } catch {
          // ignore
        }
      }
    }
    return null;
  }

  private saveAndBroadcast(room: RoomState) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PREFIX + room.id, JSON.stringify(room));
    if (this.channel) {
      this.channel.postMessage({ type: 'ROOM_UPDATE', payload: room });
    }
    this.notify(room);
  }

  private handleIncomingRoom(room: RoomState, fromLocal = true) {
    // If incoming room has a new drawn ball and we didn't initiate it, play sound & speech
    const current = this.currentRoomId ? this.getRoom(this.currentRoomId) : null;
    if (current && room.drawnBalls.length > current.drawnBalls.length) {
      const newBall = room.drawnBalls[room.drawnBalls.length - 1];
      soundService.playBallDrawnSound();
      if (room.mode === 'BINGO_75') {
        soundService.speakBall(newBall, get75BallLetter(newBall));
      } else {
        soundService.speakBall(newBall);
      }
    }

    // If incoming room declared a winner
    if (room.winner && (!current || !current.winner)) {
      soundService.playBingoFanfare();
      fireBingoConfetti();
    }

    this.notify(room);

    // If we are host, manage auto timer
    if (this.isCurrentPlayerHost(room)) {
      this.syncHostTimer(room);
    }
  }

  public isCurrentPlayerHost(room?: RoomState | null): boolean {
    const r = room || (this.currentRoomId ? this.getRoom(this.currentRoomId) : null);
    if (!r || !this.currentPlayerId) return false;
    return r.hostId === this.currentPlayerId;
  }

  public getCurrentPlayerId(): string | null {
    return this.currentPlayerId;
  }

  // Create a brand new private room
  public createRoom(
    hostName: string,
    avatar: string,
    mode: BingoMode = 'BINGO_75',
    winningRule: WinningRule = 'ANY',
    drawSpeedSeconds: number = 4
  ): { room: RoomState; playerId: string } {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const playerId = 'player_' + Math.random().toString(36).substring(2, 8);

    const initialCard = mode === 'BINGO_75' ? generate75Card() : generate90Card();
    const markedCells: boolean[][] = initialCard.map((row) => row.map(() => false));
    if (mode === 'BINGO_75') {
      markedCells[2][2] = true; // Free space in center
    }

    const hostPlayer: PlayerProfile = {
      id: playerId,
      name: hostName.trim() || 'Anfitrião',
      avatar: avatar || '👑',
      isHost: true,
      themeId: 'casino_gold',
      markerId: 'stamp_gold',
      cardNumbers: initialCard,
      markedCells,
      joinedAt: Date.now(),
    };

    const newRoom: RoomState = {
      id: roomId,
      code: roomCode,
      name: `Sala de ${hostPlayer.name}`,
      hostId: playerId,
      mode,
      status: 'WAITING',
      drawSpeedSeconds,
      winningRule,
      drawnBalls: [],
      currentBall: null,
      previousBalls: [],
      players: { [playerId]: hostPlayer },
      chat: [
        {
          id: 'sys_' + Date.now(),
          senderId: 'system',
          senderName: 'Sistema',
          text: `Bem-vindos ao Bingo Real-Time! Sala criada no modo ${mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}.`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      winner: null,
      createdAt: Date.now(),
      startedAt: null,
    };

    this.currentRoomId = roomId;
    this.currentPlayerId = playerId;
    this.saveAndBroadcast(newRoom);

    return { room: newRoom, playerId };
  }

  // Join an existing room with code
  public joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string
  ): { success: boolean; room?: RoomState; playerId?: string; error?: string } {
    const room = this.findRoomByCode(roomCode);
    if (!room) {
      return { success: false, error: 'Código de sala não encontrado. Verifique e tente novamente.' };
    }

    const playerId = 'player_' + Math.random().toString(36).substring(2, 8);
    const card = room.mode === 'BINGO_75' ? generate75Card() : generate90Card();
    const markedCells = card.map((row) => row.map(() => false));
    if (room.mode === 'BINGO_75') {
      markedCells[2][2] = true;
    }

    const newPlayer: PlayerProfile = {
      id: playerId,
      name: playerName.trim() || 'Jogador ' + Math.floor(Math.random() * 100),
      avatar: avatar || '🎲',
      isHost: false,
      themeId: 'casino_gold',
      markerId: 'stamp_gold',
      cardNumbers: card,
      markedCells,
      joinedAt: Date.now(),
    };

    room.players[playerId] = newPlayer;
    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Sistema',
      text: `${newPlayer.avatar} ${newPlayer.name} entrou na sala!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    this.currentRoomId = room.id;
    this.currentPlayerId = playerId;
    this.saveAndBroadcast(room);

    soundService.playChatPing();

    return { success: true, room, playerId };
  }

  // Regenerate player card numbers before or during pregame
  public regenerateCard(themeId?: string, markerId?: string) {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || room.status === 'PLAYING') return;

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    const newCard = room.mode === 'BINGO_75' ? generate75Card() : generate90Card();
    const newMarked = newCard.map((row) => row.map(() => false));
    if (room.mode === 'BINGO_75') {
      newMarked[2][2] = true;
    }

    player.cardNumbers = newCard;
    player.markedCells = newMarked;
    if (themeId) player.themeId = themeId;
    if (markerId) player.markerId = markerId;

    this.saveAndBroadcast(room);
  }

  // Update visual theme / marker without changing numbers
  public updateCustomization(themeId: string, markerId: string) {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room) return;

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    player.themeId = themeId;
    player.markerId = markerId;
    this.saveAndBroadcast(room);
  }

  // Toggle mark on cell
  public toggleCell(r: number, c: number) {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room) return;

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    // Center free cell in 75 mode cannot be unmarked
    if (room.mode === 'BINGO_75' && r === 2 && c === 2) return;

    // Toggle
    player.markedCells[r][c] = !player.markedCells[r][c];
    soundService.playMarkSound();

    this.saveAndBroadcast(room);
  }

  // Auto-mark helper: mark all legitimately drawn numbers that are on this card
  public autoMarkDrawn() {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room) return;

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    const drawnSet = new Set(room.drawnBalls);
    let changed = false;

    player.cardNumbers.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val > 0 && drawnSet.has(val) && !player.markedCells[r][c]) {
          player.markedCells[r][c] = true;
          changed = true;
        }
      });
    });

    if (changed) {
      soundService.playMarkSound();
      this.saveAndBroadcast(room);
    }
  }

  // Start the game (Host only)
  public startGame() {
    if (!this.currentRoomId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return;

    room.status = 'PLAYING';
    room.startedAt = Date.now();
    room.drawnBalls = [];
    room.currentBall = null;
    room.previousBalls = [];
    room.winner = null;

    // Clear marks on all players (except free space in 75)
    Object.values(room.players).forEach((p) => {
      p.markedCells = p.cardNumbers.map((row) => row.map(() => false));
      if (room.mode === 'BINGO_75') {
        p.markedCells[2][2] = true;
      }
    });

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Sistema',
      text: '🎱 O globo começou a girar! Boa sorte a todos!',
      timestamp: Date.now(),
      isSystem: true,
    });

    this.saveAndBroadcast(room);
    this.drawNextBall();
  }

  // Pause / Resume game
  public togglePause() {
    if (!this.currentRoomId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return;

    if (room.status === 'PLAYING') {
      room.status = 'PAUSED';
      if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Sistema',
        text: '⏸️ O sorteio foi pausado pelo anfitrião.',
        timestamp: Date.now(),
        isSystem: true,
      });
    } else if (room.status === 'PAUSED') {
      room.status = 'PLAYING';
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Sistema',
        text: '▶️ O sorteio foi retomado!',
        timestamp: Date.now(),
        isSystem: true,
      });
    }

    this.saveAndBroadcast(room);
  }

  // Set draw speed (seconds)
  public setSpeed(seconds: number) {
    if (!this.currentRoomId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return;

    room.drawSpeedSeconds = Math.max(2, Math.min(12, seconds));
    this.saveAndBroadcast(room);
  }

  // Draw next ball (Host or Auto)
  public drawNextBall(): boolean {
    if (!this.currentRoomId) return false;
    const room = this.getRoom(this.currentRoomId);
    if (!room || (room.status !== 'PLAYING' && room.status !== 'WAITING')) return false;

    const maxBalls = room.mode === 'BINGO_75' ? 75 : 90;
    const drawnSet = new Set(room.drawnBalls);

    // Remaining candidates
    const available: number[] = [];
    for (let i = 1; i <= maxBalls; i++) {
      if (!drawnSet.has(i)) available.push(i);
    }

    if (available.length === 0) {
      room.status = 'FINISHED';
      if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Sistema',
        text: '🏁 Todas as pedras foram sorteadas! Fim de jogo.',
        timestamp: Date.now(),
        isSystem: true,
      });
      this.saveAndBroadcast(room);
      return false;
    }

    const nextBall = available[Math.floor(Math.random() * available.length)];
    if (room.currentBall !== null) {
      room.previousBalls = [room.currentBall, ...room.previousBalls.slice(0, 7)];
    }
    room.currentBall = nextBall;
    room.drawnBalls.push(nextBall);

    // Simulated bots auto-mark
    Object.values(room.players).forEach((p) => {
      if (p.isBot) {
        p.cardNumbers.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val === nextBall) {
              p.markedCells[r][c] = true;
            }
          });
        });
      }
    });

    // Sound and voice
    soundService.playBallDrawnSound();
    if (room.mode === 'BINGO_75') {
      soundService.speakBall(nextBall, get75BallLetter(nextBall));
    } else {
      soundService.speakBall(nextBall);
    }

    this.saveAndBroadcast(room);
    return true;
  }

  private syncHostTimer(room: RoomState) {
    if (this.autoDrawTimer) {
      clearInterval(this.autoDrawTimer);
      this.autoDrawTimer = null;
    }

    if (room.status === 'PLAYING' && !room.winner) {
      this.autoDrawTimer = setInterval(() => {
        const current = this.currentRoomId ? this.getRoom(this.currentRoomId) : null;
        if (current && current.status === 'PLAYING' && !current.winner) {
          this.drawNextBall();
        } else {
          if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);
        }
      }, room.drawSpeedSeconds * 1000);
    }
  }

  // Player claims BINGO
  public claimBingo(): { success: boolean; message: string } {
    if (!this.currentRoomId || !this.currentPlayerId) {
      return { success: false, message: 'Você não está em uma sala ativa.' };
    }

    const room = this.getRoom(this.currentRoomId);
    if (!room || room.status !== 'PLAYING') {
      return { success: false, message: 'O jogo precisa estar em andamento para cantar bingo.' };
    }

    if (room.winner) {
      return { success: false, message: `O bingo já foi cantado por ${room.winner.winnerName}!` };
    }

    const player = room.players[this.currentPlayerId];
    if (!player) {
      return { success: false, message: 'Jogador não encontrado.' };
    }

    // STRICT AUDIT
    const audit = checkVictory(
      player.cardNumbers,
      player.markedCells,
      room.drawnBalls,
      room.mode,
      room.winningRule
    );

    if (!audit.isWinner) {
      // Invalid bingo call
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Auditoria',
        text: `⚠️ ${player.avatar} ${player.name} cantou BINGO, mas a cartela ainda não completou os requisitos ou possui números não sorteados!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      this.saveAndBroadcast(room);
      return {
        success: false,
        message: 'Bingo inválido! Verifique se todos os números marcados foram realmente sorteados.',
      };
    }

    // VALID BINGO!
    room.status = 'FINISHED';
    if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);

    room.winner = {
      winnerId: player.id,
      winnerName: player.name,
      winnerAvatar: player.avatar,
      winningPattern: audit.patternName,
      verifiedBalls: room.drawnBalls,
      timestamp: Date.now(),
    };

    room.chat.push({
      id: 'bingo_' + Date.now(),
      senderId: player.id,
      senderName: player.name,
      senderAvatar: player.avatar,
      text: `🎉🏆 BINGOOOOOOOO! Vitória confirmada com "${audit.patternName}"!`,
      timestamp: Date.now(),
      isBingoCall: true,
    });

    soundService.playBingoFanfare();
    fireBingoConfetti();
    this.saveAndBroadcast(room);

    return { success: true, message: `Parabéns! Vitória auditada com ${audit.patternName}!` };
  }

  // Send chat message
  public sendChatMessage(text: string, reaction?: string) {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room) return;

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    const cleanText = text.trim();
    if (!cleanText && !reaction) return;

    const msg: ChatMessage = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 5),
      senderId: player.id,
      senderName: player.name,
      senderAvatar: player.avatar,
      text: cleanText || reaction || '',
      reaction,
      timestamp: Date.now(),
    };

    room.chat.push(msg);
    // Keep max 80 messages
    if (room.chat.length > 80) {
      room.chat = room.chat.slice(-80);
    }

    soundService.playChatPing();
    this.saveAndBroadcast(room);
  }

  // Add simulated party bot players
  public addPartyBots(count: number = 3) {
    if (!this.currentRoomId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return;

    const botNames = [
      { name: 'Dona Neusa', avatar: '👵', theme: 'vintage_sepia' },
      { name: 'Vovô Tonho', avatar: '👴', theme: 'casino_gold' },
      { name: 'Carlinhos 77', avatar: '🍀', theme: 'emerald_velvet' },
      { name: 'Bia do Bingo', avatar: '👑', theme: 'neon_cyber' },
      { name: 'Marcão da Sorte', avatar: '🔥', theme: 'casino_gold' },
    ];

    const currentNames = new Set(Object.values(room.players).map((p) => p.name));
    const available = botNames.filter((b) => !currentNames.has(b.name));

    for (let i = 0; i < Math.min(count, available.length); i++) {
      const bot = available[i];
      const botId = 'bot_' + Math.random().toString(36).substring(2, 7);
      const card = room.mode === 'BINGO_75' ? generate75Card() : generate90Card();
      const marked = card.map((row) => row.map(() => false));
      if (room.mode === 'BINGO_75') marked[2][2] = true;

      // If game already started, mark drawn balls
      const drawnSet = new Set(room.drawnBalls);
      card.forEach((row, r) => {
        row.forEach((n, c) => {
          if (n > 0 && drawnSet.has(n)) marked[r][c] = true;
        });
      });

      room.players[botId] = {
        id: botId,
        name: bot.name,
        avatar: bot.avatar,
        isHost: false,
        isBot: true,
        themeId: bot.theme,
        markerId: 'stamp_gold',
        cardNumbers: card,
        markedCells: marked,
        joinedAt: Date.now(),
      };

      room.chat.push({
        id: 'sys_' + Date.now() + i,
        senderId: 'system',
        senderName: 'Sistema',
        text: `${bot.avatar} ${bot.name} (Convidado) juntou-se à mesa!`,
        timestamp: Date.now(),
        isSystem: true,
      });
    }

    this.saveAndBroadcast(room);
  }

  // Restart / New Round
  public restartRound() {
    if (!this.currentRoomId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return;

    if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);

    room.status = 'WAITING';
    room.winner = null;
    room.drawnBalls = [];
    room.currentBall = null;
    room.previousBalls = [];

    // Give each player a fresh card
    Object.values(room.players).forEach((p) => {
      const card = room.mode === 'BINGO_75' ? generate75Card() : generate90Card();
      const marked = card.map((row) => row.map(() => false));
      if (room.mode === 'BINGO_75') marked[2][2] = true;
      p.cardNumbers = card;
      p.markedCells = marked;
    });

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Sistema',
      text: '🔄 Nova rodada configurada! Preparem suas cartelas.',
      timestamp: Date.now(),
      isSystem: true,
    });

    this.saveAndBroadcast(room);
  }

  // Leave room
  public leaveRoom() {
    if (this.autoDrawTimer) {
      clearInterval(this.autoDrawTimer);
      this.autoDrawTimer = null;
    }
    this.currentRoomId = null;
    this.currentPlayerId = null;
  }
}

export const multiplayerService = new MultiplayerService();
