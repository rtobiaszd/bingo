import { BingoMode, ChatMessage, PlayerProfile, RoomState, WinningRule, PublicRoomSummary } from '../types/bingo';
import { generate75Card, generate90Card, checkVictory, get75BallLetter } from '../utils/bingoRules';
import { soundService } from './soundService';
import { fireBingoConfetti } from '../utils/confetti';
import { Peer, DataConnection } from 'peerjs';

const STORAGE_KEY_PREFIX = 'bingo_room_';
const CHANNEL_NAME = 'bingo_club_realtime_bus';
const PEER_PREFIX = 'bingo-club-room-';

export type RoomEventListener = (room: RoomState) => void;

class MultiplayerService {
  private channel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private currentPlayerId: string | null = null;
  private listeners: Set<RoomEventListener> = new Set();
  private autoDrawTimer: NodeJS.Timeout | null = null;
  private serverPollTimer: NodeJS.Timeout | null = null;
  private cachedServerRooms: PublicRoomSummary[] = [];
  private lastTimerSpeed: number = 0;
  private lastTimerStatus: string = '';

  // Cross-device PeerJS networking
  private peer: Peer | null = null;
  private hostConnections: Map<string, DataConnection> = new Map(); // For host: connected guests
  private guestConnection: DataConnection | null = null; // For guest: connection to host

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'ROOM_UPDATE' && payload && payload.id === this.currentRoomId) {
          this.handleIncomingRoom(payload, false);
        }
      };

      // Storage event for cross-tab sync fallback
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_KEY_PREFIX) && e.newValue) {
          try {
            const updatedRoom = JSON.parse(e.newValue) as RoomState;
            if (updatedRoom.id === this.currentRoomId) {
              this.handleIncomingRoom(updatedRoom, false);
            }
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public subscribe(listener: RoomEventListener): () => void {
    this.listeners.add(listener);
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

  public async fetchOpenRooms(): Promise<PublicRoomSummary[]> {
    if (typeof window === 'undefined') return [];
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          this.cachedServerRooms = list;
        }
      }
    } catch {
      // ignore
    }
    return this.getAvailableLocalRooms();
  }

  public getAvailableLocalRooms(): PublicRoomSummary[] {
    if (typeof window === 'undefined') return [];

    // Trigger async refresh in background
    fetch('/api/rooms')
      .then((r) => (r.ok ? r.json() : []))
      .then((serverList: PublicRoomSummary[]) => {
        if (Array.isArray(serverList)) {
          this.cachedServerRooms = serverList;
        }
      })
      .catch(() => {});

    const seenCodes = new Set<string>();
    const rooms: PublicRoomSummary[] = [];

    // 1. Local storage open rooms (exclude private rooms with code!)
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const room = JSON.parse(localStorage.getItem(key)!) as RoomState;
          // Filter: only show if NOT private and recent (< 6 hours)
          if (room && room.code && !room.isPrivate && now - room.createdAt < 6 * 3600 * 1000) {
            seenCodes.add(room.code);
            const hostPlayer = room.players && room.hostId ? room.players[room.hostId] : null;
            rooms.push({
              id: room.id,
              code: room.code,
              name: room.name || (hostPlayer ? `Sala de ${hostPlayer.name}` : 'Mesa Aberta'),
              hostName: hostPlayer?.name || 'Anfitrião',
              hostAvatar: hostPlayer?.avatar || '👑',
              mode: room.mode,
              modeLabel: room.mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas',
              playerCount: Object.keys(room.players || {}).length,
              maxPlayers: room.maxPlayers || 20,
              status: room.status,
              isPrivate: false,
              winningRule: room.winningRule,
              drawSpeedSeconds: room.drawSpeedSeconds,
              prizeTitle: room.prizeTitle,
              prizeImageUrl: room.prizeImageUrl,
              createdAt: room.createdAt,
            });
          }
        } catch {
          // ignore
        }
      }
    }

    // 2. Server API rooms from other devices (already filtered to only open rooms)
    for (const sr of this.cachedServerRooms) {
      if (sr && sr.code && !seenCodes.has(sr.code)) {
        seenCodes.add(sr.code);
        rooms.push(sr);
      }
    }

    return rooms;
  }

  private saveAndBroadcast(room: RoomState) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PREFIX + room.id, JSON.stringify(room));
    if (this.channel) {
      this.channel.postMessage({ type: 'ROOM_UPDATE', payload: room });
    }

    // Broadcast across all connected remote peer devices
    this.hostConnections.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'ROOM_UPDATE', room });
      }
    });

    this.notify(room);

    // Synchronize host automatic draw timer
    if (this.isCurrentPlayerHost(room)) {
      this.syncHostTimer(room);
    }

    // Synchronize with central server for cross-device visibility
    fetch(`/api/rooms/${room.code}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    }).catch(() => {});
  }

  private handleIncomingRoom(room: RoomState, fromLocal = true) {
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

    if (room.winner && (!current || !current.winner)) {
      soundService.playBingoFanfare();
      fireBingoConfetti();
    }

    localStorage.setItem(STORAGE_KEY_PREFIX + room.id, JSON.stringify(room));
    this.notify(room);

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

  // Create a brand new private room with cross-device WebRTC capability
  public createRoom(
    hostName: string,
    avatar: string,
    mode: BingoMode = 'BINGO_75',
    winningRule: WinningRule = 'ANY',
    drawSpeedSeconds: number = 4,
    isPrivate: boolean = false,
    customRoomName?: string,
    prizeTitle?: string,
    prizeImageUrl?: string
  ): { room: RoomState; playerId: string } {
    this.leaveRoom();

    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const playerId = 'player_' + Math.random().toString(36).substring(2, 8);

    const initialCard = mode === 'BINGO_75' ? generate75Card() : generate90Card();
    const markedCells: boolean[][] = initialCard.map((row) => row.map(() => false));
    if (mode === 'BINGO_75') {
      markedCells[2][2] = true;
    }

    const hostPlayer: PlayerProfile = {
      id: playerId,
      name: hostName.trim() || 'Anfitrião',
      avatar: avatar || '👑',
      isHost: true,
      themeId: 'neon_night',
      markerId: 'stamp_glow',
      cardNumbers: initialCard,
      markedCells,
      joinedAt: Date.now(),
    };

    const newRoom: RoomState = {
      id: roomId,
      code: roomCode,
      name: (customRoomName && customRoomName.trim()) || `Mesa de ${hostPlayer.name}`,
      hostId: playerId,
      mode,
      status: 'WAITING',
      drawSpeedSeconds,
      winningRule,
      isPrivate,
      maxPlayers: 20,
      prizeTitle: prizeTitle || 'Smart TV 55" 4K Crystal UHD',
      prizeImageUrl:
        prizeImageUrl ||
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      drawnBalls: [],
      currentBall: null,
      previousBalls: [],
      players: { [playerId]: hostPlayer },
      chat: [
        {
          id: 'sys_' + Date.now(),
          senderId: 'system',
          senderName: 'Sistema',
          text: `Bem-vindos ao Bingo Club! Sala criada no modo ${mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'}.`,
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

    // Register on central server for cross-device discovery
    fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom),
    }).catch(() => {});

    // Initialize Host PeerJS listener for remote cross-device guests
    try {
      this.initHostPeer(roomCode, newRoom);
    } catch {
      // Fallback to local
    }

    return { room: newRoom, playerId };
  }

  private initHostPeer(roomCode: string, initialRoom: RoomState) {
    if (typeof window === 'undefined') return;
    const peerId = PEER_PREFIX + roomCode;

    this.peer = new Peer(peerId);

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.hostConnections.set(conn.peer, conn);
        // Send current room state to new guest
        const current = this.currentRoomId ? this.getRoom(this.currentRoomId) : initialRoom;
        if (current) {
          conn.send({ type: 'ROOM_UPDATE', room: current });
        }
      });

      conn.on('data', (raw: unknown) => {
        const data = raw as { type: string; payload?: unknown };
        if (!data || !this.currentRoomId) return;
        const room = this.getRoom(this.currentRoomId);
        if (!room) return;

        if (data.type === 'GUEST_JOIN') {
          const { guestPlayer } = data.payload as { guestPlayer: PlayerProfile };
          if (guestPlayer && !room.players[guestPlayer.id]) {
            room.players[guestPlayer.id] = guestPlayer;
            room.chat.push({
              id: 'sys_' + Date.now(),
              senderId: 'system',
              senderName: 'Sistema',
              text: `${guestPlayer.avatar} ${guestPlayer.name} entrou na sala!`,
              timestamp: Date.now(),
              isSystem: true,
            });
            this.saveAndBroadcast(room);
          }
        } else if (data.type === 'GUEST_ACTION') {
          const { action, payload } = data.payload as { action: string; payload: any };
          this.handleGuestAction(room, action, payload);
        }
      });

      conn.on('close', () => {
        this.hostConnections.delete(conn.peer);
      });
    });

    this.peer.on('error', () => {
      // Ignore or retry
    });
  }

  private handleGuestAction(room: RoomState, action: string, payload: any) {
    if (action === 'TOGGLE_CELL') {
      const { playerId, r, c } = payload;
      const player = room.players[playerId];
      if (player) {
        if (!(room.mode === 'BINGO_75' && r === 2 && c === 2)) {
          player.markedCells[r][c] = !player.markedCells[r][c];
          this.saveAndBroadcast(room);
        }
      }
    } else if (action === 'AUTO_MARK') {
      const { playerId } = payload;
      const player = room.players[playerId];
      if (player) {
        const drawnSet = new Set(room.drawnBalls);
        player.cardNumbers.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val > 0 && drawnSet.has(val)) {
              player.markedCells[r][c] = true;
            }
          });
        });
        this.saveAndBroadcast(room);
      }
    } else if (action === 'CHAT_MESSAGE') {
      const { message } = payload;
      if (message) {
        room.chat.push(message);
        if (room.chat.length > 80) room.chat = room.chat.slice(-80);
        soundService.playChatPing();
        this.saveAndBroadcast(room);
      }
    } else if (action === 'CLAIM_BINGO') {
      const { playerId } = payload;
      const player = room.players[playerId];
      if (player && room.status === 'PLAYING' && !room.winner) {
        const audit = checkVictory(
          player.cardNumbers,
          player.markedCells,
          room.drawnBalls,
          room.mode,
          room.winningRule
        );
        if (audit.isWinner) {
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
            text: `🎉 BINGOOOO! ${player.name} venceu com "${audit.patternName}"!`,
            timestamp: Date.now(),
            isBingoCall: true,
          });
          soundService.playBingoFanfare();
          fireBingoConfetti();
        } else {
          room.chat.push({
            id: 'sys_' + Date.now(),
            senderId: 'system',
            senderName: 'Auditoria',
            text: `⚠️ ${player.name} cantou bingo, mas ainda não completou os números válidos!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }
        this.saveAndBroadcast(room);
      }
    }
  }

  // Join an existing room with code (works local & cross-device)
  public async joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string
  ): Promise<{ success: boolean; room?: RoomState; playerId?: string; error?: string }> {
    const cleanCode = roomCode.trim().toUpperCase();

    // 1. Try local room first
    const localRoom = this.findRoomByCode(cleanCode);
    if (localRoom) {
      const playerId = 'player_' + Math.random().toString(36).substring(2, 8);
      const card = localRoom.mode === 'BINGO_75' ? generate75Card() : generate90Card();
      const markedCells = card.map((row) => row.map(() => false));
      if (localRoom.mode === 'BINGO_75') {
        markedCells[2][2] = true;
      }

      const newPlayer: PlayerProfile = {
        id: playerId,
        name: playerName.trim() || 'Jogador ' + Math.floor(Math.random() * 100),
        avatar: avatar || '🎲',
        isHost: false,
        themeId: 'neon_night',
        markerId: 'stamp_glow',
        cardNumbers: card,
        markedCells,
        joinedAt: Date.now(),
      };

      localRoom.players[playerId] = newPlayer;
      localRoom.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Sistema',
        text: `${newPlayer.avatar} ${newPlayer.name} entrou na sala!`,
        timestamp: Date.now(),
        isSystem: true,
      });

      this.currentRoomId = localRoom.id;
      this.currentPlayerId = playerId;
      this.saveAndBroadcast(localRoom);
      soundService.playChatPing();

      return { success: true, room: localRoom, playerId };
    }

    // 2. Try Central Server API for instant cross-device connectivity
    try {
      const resp = await fetch(`/api/rooms/${cleanCode}`);
      if (resp.ok) {
        const serverRoom = (await resp.json()) as RoomState;
        if (serverRoom && serverRoom.code === cleanCode) {
          const playerId = 'player_' + Math.random().toString(36).substring(2, 8);
          const card = serverRoom.mode === 'BINGO_75' ? generate75Card() : generate90Card();
          const markedCells = card.map((row) => row.map(() => false));
          if (serverRoom.mode === 'BINGO_75') {
            markedCells[2][2] = true;
          }

          const guestProfile: PlayerProfile = {
            id: playerId,
            name: playerName.trim() || 'Jogador ' + Math.floor(Math.random() * 100),
            avatar: avatar || '🎲',
            isHost: false,
            themeId: 'neon_night',
            markerId: 'stamp_glow',
            cardNumbers: card,
            markedCells,
            joinedAt: Date.now(),
          };

          // Register guest on server
          await fetch(`/api/rooms/${cleanCode}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player: guestProfile }),
          });

          if (!serverRoom.players) serverRoom.players = {};
          serverRoom.players[playerId] = guestProfile;

          this.currentRoomId = serverRoom.id;
          this.currentPlayerId = playerId;
          localStorage.setItem(STORAGE_KEY_PREFIX + serverRoom.id, JSON.stringify(serverRoom));
          this.handleIncomingRoom(serverRoom, false);
          soundService.playChatPing();

          // Start active polling to sync room state with host in real-time
          this.startServerPolling(cleanCode);

          return { success: true, room: serverRoom, playerId };
        }
      }
    } catch {
      // Fallback to PeerJS WebRTC
    }

    // 3. Fallback Cross-device WebRTC PeerJS Connection
    return new Promise((resolve) => {
      const hostPeerId = PEER_PREFIX + cleanCode;
      const guestPeer = new Peer();

      const timeout = setTimeout(() => {
        try {
          guestPeer.destroy();
        } catch {}
        resolve({
          success: false,
          error: 'Código não encontrado ou o anfitrião está offline. Verifique o código e tente novamente.',
        });
      }, 7000);

      guestPeer.on('open', () => {
        const conn = guestPeer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          clearTimeout(timeout);
          this.guestConnection = conn;
          this.peer = guestPeer;

          const playerId = 'player_' + Math.random().toString(36).substring(2, 8);

          conn.on('data', (raw: unknown) => {
            const data = raw as { type: string; room?: RoomState };
            if (data && data.type === 'ROOM_UPDATE' && data.room) {
              const remoteRoom = data.room;

              // Check if our player is already in remoteRoom
              if (!remoteRoom.players[playerId]) {
                const card = remoteRoom.mode === 'BINGO_75' ? generate75Card() : generate90Card();
                const marked = card.map((row) => row.map(() => false));
                if (remoteRoom.mode === 'BINGO_75') marked[2][2] = true;

                const guestProfile: PlayerProfile = {
                  id: playerId,
                  name: playerName.trim() || 'Jogador',
                  avatar: avatar || '🎲',
                  isHost: false,
                  themeId: 'neon_night',
                  markerId: 'stamp_glow',
                  cardNumbers: card,
                  markedCells: marked,
                  joinedAt: Date.now(),
                };

                conn.send({
                  type: 'GUEST_JOIN',
                  payload: { guestPlayer: guestProfile },
                });
                remoteRoom.players[playerId] = guestProfile;
              }

              this.currentRoomId = remoteRoom.id;
              this.currentPlayerId = playerId;
              localStorage.setItem(STORAGE_KEY_PREFIX + remoteRoom.id, JSON.stringify(remoteRoom));
              this.handleIncomingRoom(remoteRoom, false);
              resolve({ success: true, room: remoteRoom, playerId });
            }
          });
        });

        conn.on('error', () => {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: 'Não foi possível conectar à sala. Verifique se o anfitrião ainda está online.',
          });
        });
      });

      guestPeer.on('error', () => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: 'Código de sala inválido ou anfitrião desconectado.',
        });
      });
    });
  }

  // Regenerate player card numbers
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

  // Update theme / marker without changing numbers
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

    // If we are guest on remote peer connection, forward action to host
    if (this.guestConnection && this.guestConnection.open) {
      this.guestConnection.send({
        type: 'GUEST_ACTION',
        payload: { action: 'TOGGLE_CELL', payload: { playerId: this.currentPlayerId, r, c } },
      });
    }

    const player = room.players[this.currentPlayerId];
    if (!player) return;

    if (room.mode === 'BINGO_75' && r === 2 && c === 2) return;

    player.markedCells[r][c] = !player.markedCells[r][c];
    soundService.playMarkSound();
    this.saveAndBroadcast(room);
  }

  // Auto-mark helper
  public autoMarkDrawn() {
    if (!this.currentRoomId || !this.currentPlayerId) return;
    const room = this.getRoom(this.currentRoomId);
    if (!room) return;

    if (this.guestConnection && this.guestConnection.open) {
      this.guestConnection.send({
        type: 'GUEST_ACTION',
        payload: { action: 'AUTO_MARK', payload: { playerId: this.currentPlayerId } },
      });
    }

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
      text: '🎱 O globo começou a rodar! Boa sorte aos jogadores!',
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
        text: '⏸️ Sorteio pausado pelo anfitrião.',
        timestamp: Date.now(),
        isSystem: true,
      });
    } else if (room.status === 'PAUSED') {
      room.status = 'PLAYING';
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Sistema',
        text: '▶️ Sorteio retomado!',
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
        text: '🏁 Todas as pedras foram sorteadas! Fim da rodada.',
        timestamp: Date.now(),
        isSystem: true,
      });
      this.saveAndBroadcast(room);
      return false;
    }

    const nextBall = available[Math.floor(Math.random() * available.length)];
    if (room.currentBall !== null) {
      room.previousBalls = [room.currentBall, ...room.previousBalls.slice(0, 9)];
    }
    room.currentBall = nextBall;
    room.drawnBalls.push(nextBall);

    soundService.playBallDrawnSound();
    if (room.mode === 'BINGO_75') {
      soundService.speakBall(nextBall, get75BallLetter(nextBall));
    } else {
      soundService.speakBall(nextBall);
    }

    // Auto-mark bot cards and check if a bot claims victory
    let botWon = false;
    Object.values(room.players).forEach((p) => {
      if (p.isBot) {
        p.cardNumbers.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val === nextBall) {
              p.markedCells[r][c] = true;
            }
          });
        });

        if (!room.winner && !botWon && room.status === 'PLAYING') {
          const audit = checkVictory(
            p.cardNumbers,
            p.markedCells,
            room.drawnBalls,
            room.mode,
            room.winningRule
          );
          if (audit.isWinner) {
            botWon = true;
            room.status = 'FINISHED';
            if (this.autoDrawTimer) clearInterval(this.autoDrawTimer);
            room.winner = {
              winnerId: p.id,
              winnerName: p.name,
              winnerAvatar: p.avatar,
              winningPattern: audit.patternName,
              verifiedBalls: room.drawnBalls,
              timestamp: Date.now(),
            };
            room.chat.push({
              id: 'bingo_' + Date.now(),
              senderId: p.id,
              senderName: p.name,
              senderAvatar: p.avatar,
              text: `🎉🏆 BINGOOOO! ${p.name} gritou bingo com "${audit.patternName}"!`,
              timestamp: Date.now(),
              isBingoCall: true,
            });
            soundService.playBingoFanfare();
            fireBingoConfetti();
          }
        }
      }
    });

    this.saveAndBroadcast(room);
    return true;
  }

  public addBotPlayer(): boolean {
    if (!this.currentRoomId) return false;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return false;

    const BOT_PROFILES = [
      { name: 'Mariana Sorte', avatar: '🍀', themeId: 'electric_mint', markerId: 'clover_lucky' },
      { name: 'Lucas Fera', avatar: '🦁', themeId: 'royal_gold', markerId: 'star_neon' },
      { name: 'Bia Campeã', avatar: '⭐', themeId: 'cyber_purple', markerId: 'heart_ruby' },
      { name: 'Thiago 777', avatar: '💎', themeId: 'neon_night', markerId: 'chip_casino' },
      { name: 'Renata Bingo', avatar: '🔥', themeId: 'royal_gold', markerId: 'fire_pulse' },
      { name: 'Pedro Astral', avatar: '🚀', themeId: 'neon_night', markerId: 'stamp_glow' },
    ];

    const currentNames = new Set(Object.values(room.players).map((p) => p.name));
    const available = BOT_PROFILES.filter((b) => !currentNames.has(b.name));
    if (available.length === 0) return false;

    const chosen = available[Math.floor(Math.random() * available.length)];
    const botId = 'bot_' + Math.random().toString(36).substring(2, 7);
    const card = room.mode === 'BINGO_75' ? generate75Card() : generate90Card();
    const marked = card.map((row) => row.map(() => false));
    if (room.mode === 'BINGO_75') marked[2][2] = true;

    const botPlayer: PlayerProfile = {
      id: botId,
      name: chosen.name,
      avatar: chosen.avatar,
      isHost: false,
      isBot: true,
      themeId: chosen.themeId,
      markerId: chosen.markerId,
      cardNumbers: card,
      markedCells: marked,
      joinedAt: Date.now(),
    };

    room.players[botId] = botPlayer;
    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Sistema',
      text: `${botPlayer.avatar} ${botPlayer.name} (Convidado) sentou à mesa!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    this.saveAndBroadcast(room);
    soundService.playChatPing();
    return true;
  }

  public removePlayer(playerId: string): boolean {
    if (!this.currentRoomId) return false;
    const room = this.getRoom(this.currentRoomId);
    if (!room || !this.isCurrentPlayerHost(room)) return false;
    if (room.hostId === playerId) return false;

    const removed = room.players[playerId];
    if (!removed) return false;

    delete room.players[playerId];
    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Sistema',
      text: `${removed.avatar} ${removed.name} saiu da sala.`,
      timestamp: Date.now(),
      isSystem: true,
    });

    this.saveAndBroadcast(room);
    return true;
  }

  private syncHostTimer(room: RoomState) {
    if (room.status !== 'PLAYING' || room.winner) {
      if (this.autoDrawTimer) {
        clearInterval(this.autoDrawTimer);
        this.autoDrawTimer = null;
      }
      this.lastTimerStatus = room.status;
      return;
    }

    // Keep running if already active with same speed
    if (this.autoDrawTimer && this.lastTimerSpeed === room.drawSpeedSeconds && this.lastTimerStatus === 'PLAYING') {
      return;
    }

    if (this.autoDrawTimer) {
      clearInterval(this.autoDrawTimer);
      this.autoDrawTimer = null;
    }

    this.lastTimerSpeed = room.drawSpeedSeconds;
    this.lastTimerStatus = room.status;

    this.autoDrawTimer = setInterval(() => {
      const current = this.currentRoomId ? this.getRoom(this.currentRoomId) : null;
      if (current && current.status === 'PLAYING' && !current.winner) {
        this.drawNextBall();
      } else {
        if (this.autoDrawTimer) {
          clearInterval(this.autoDrawTimer);
          this.autoDrawTimer = null;
        }
      }
    }, room.drawSpeedSeconds * 1000);
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

    // If guest on remote peer connection, forward claim to host
    if (this.guestConnection && this.guestConnection.open) {
      this.guestConnection.send({
        type: 'GUEST_ACTION',
        payload: { action: 'CLAIM_BINGO', payload: { playerId: this.currentPlayerId } },
      });
      return { success: true, message: 'Bingo cantado! Conferindo cartela com a mesa...' };
    }

    const player = room.players[this.currentPlayerId];
    if (!player) {
      return { success: false, message: 'Jogador não encontrado.' };
    }

    const audit = checkVictory(
      player.cardNumbers,
      player.markedCells,
      room.drawnBalls,
      room.mode,
      room.winningRule
    );

    if (!audit.isWinner) {
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Auditoria',
        text: `⚠️ ${player.name} cantou BINGO, mas os números não atendem aos critérios de vitória!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      this.saveAndBroadcast(room);
      return {
        success: false,
        message: 'Bingo inválido! Verifique os números marcados na sua cartela.',
      };
    }

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
      text: `🎉🏆 BINGOOOO! Vitória confirmada com "${audit.patternName}"!`,
      timestamp: Date.now(),
      isBingoCall: true,
    });

    soundService.playBingoFanfare();
    fireBingoConfetti();
    this.saveAndBroadcast(room);

    return { success: true, message: `BINGO! Parabéns pela vitória com ${audit.patternName}!` };
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

    if (this.guestConnection && this.guestConnection.open) {
      this.guestConnection.send({
        type: 'GUEST_ACTION',
        payload: { action: 'CHAT_MESSAGE', payload: { message: msg } },
      });
    }

    room.chat.push(msg);
    if (room.chat.length > 80) {
      room.chat = room.chat.slice(-80);
    }

    soundService.playChatPing();
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
      text: '🔄 Nova rodada configurada! Cartelas renovadas.',
      timestamp: Date.now(),
      isSystem: true,
    });

    this.saveAndBroadcast(room);
  }

  private startServerPolling(code: string) {
    if (this.serverPollTimer) clearInterval(this.serverPollTimer);
    this.serverPollTimer = setInterval(async () => {
      if (!this.currentRoomId) {
        if (this.serverPollTimer) {
          clearInterval(this.serverPollTimer);
          this.serverPollTimer = null;
        }
        return;
      }
      try {
        const res = await fetch(`/api/rooms/${code}`);
        if (res.ok) {
          const updated = (await res.json()) as RoomState;
          if (updated && updated.id === this.currentRoomId) {
            this.handleIncomingRoom(updated, false);
          }
        }
      } catch {
        // ignore network hiccups
      }
    }, 1500);
  }

  // Leave room
  public leaveRoom() {
    if (this.autoDrawTimer) {
      clearInterval(this.autoDrawTimer);
      this.autoDrawTimer = null;
    }
    if (this.serverPollTimer) {
      clearInterval(this.serverPollTimer);
      this.serverPollTimer = null;
    }
    if (this.guestConnection) {
      try {
        this.guestConnection.close();
      } catch {}
      this.guestConnection = null;
    }
    this.hostConnections.forEach((conn) => {
      try {
        conn.close();
      } catch {}
    });
    this.hostConnections.clear();
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.currentRoomId = null;
    this.currentPlayerId = null;
  }
}

export const multiplayerService = new MultiplayerService();
