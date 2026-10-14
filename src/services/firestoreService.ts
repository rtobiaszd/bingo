import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { RoomState, BingoCard, PlayerProfile, ChatMessage, PublicRoomSummary } from '../types/bingo';

export interface FirestorePlayerCard {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  mode: 'BINGO_75' | 'BINGO_90';
  numbers: (number | null)[][];
  markedNumbers: number[];
  isWinner: boolean;
  updatedAt?: any;
}

export const firestoreService = {
  /**
   * Cria uma sala no Firestore e registra o host e sua cartela inicial
   */
  async createRoom(
    room: RoomState,
    hostPlayer: PlayerProfile,
    hostCard: BingoCard,
    hostEmail?: string
  ): Promise<void> {
    const roomRef = doc(db, 'rooms', room.id);
    const roomPath = `rooms/${room.id}`;

    try {
      const roomPayload = {
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        hostName: hostPlayer.name,
        hostAvatar: hostPlayer.avatar,
        hostEmail: hostEmail || '',
        mode: room.mode,
        status: room.status,
        drawSpeedSeconds: room.drawSpeedSeconds,
        winningRule: room.winningRule,
        drawnBalls: room.drawnBalls || [],
        currentBall: room.currentBall || null,
        isPrivate: !!room.isPrivate,
        maxPlayers: room.maxPlayers || 50,
        winnerId: room.winnerId || null,
        winnerName: room.winnerName || null,
        playerCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(roomRef, roomPayload);

      // Registrar Host em participantes
      const hostPartRef = doc(db, 'rooms', room.id, 'participants', hostPlayer.id);
      await setDoc(hostPartRef, {
        id: hostPlayer.id,
        name: hostPlayer.name,
        avatar: hostPlayer.avatar,
        email: hostEmail || '',
        isHost: true,
        isConnected: true,
        joinedAt: new Date().toISOString(),
      });

      // Registrar cartela inicial do Host
      const cardRef = doc(db, 'rooms', room.id, 'cards', hostCard.id);
      await setDoc(cardRef, {
        id: hostCard.id,
        roomId: room.id,
        playerId: hostPlayer.id,
        playerName: hostPlayer.name,
        playerAvatar: hostPlayer.avatar,
        mode: room.mode,
        numbers: hostCard.numbers,
        markedNumbers: hostCard.markedNumbers || [],
        isWinner: !!hostCard.isWinner,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, roomPath);
    }
  },

  /**
   * Jogador entra na sala do Firestore com seu perfil e cartela gerada
   */
  async joinRoom(
    roomId: string,
    player: PlayerProfile,
    card: BingoCard,
    playerEmail?: string
  ): Promise<void> {
    const path = `rooms/${roomId}/participants/${player.id}`;
    try {
      // Registrar participante
      const partRef = doc(db, 'rooms', roomId, 'participants', player.id);
      await setDoc(
        partRef,
        {
          id: player.id,
          name: player.name,
          avatar: player.avatar,
          email: playerEmail || '',
          isHost: player.isHost,
          isConnected: true,
          joinedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Registrar cartela do jogador
      const cardRef = doc(db, 'rooms', roomId, 'cards', card.id);
      await setDoc(
        cardRef,
        {
          id: card.id,
          roomId,
          playerId: player.id,
          playerName: player.name,
          playerAvatar: player.avatar,
          mode: card.mode,
          numbers: card.numbers,
          markedNumbers: card.markedNumbers || [],
          isWinner: !!card.isWinner,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Atualizar contagem de jogadores da sala
      const partsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        playerCount: partsSnap.size,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Atualiza a cartela de um jogador (números marcados, vitória)
   */
  async updatePlayerCard(
    roomId: string,
    cardId: string,
    markedNumbers: number[],
    isWinner: boolean = false
  ): Promise<void> {
    const cardRef = doc(db, 'rooms', roomId, 'cards', cardId);
    try {
      await updateDoc(cardRef, {
        markedNumbers,
        isWinner,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Non-blocking card update error in firestore:', error);
    }
  },

  /**
   * Atualiza o estado da sala (bolas sorteadas, status, velocidade, vencedor)
   */
  async updateRoomState(roomId: string, updates: Partial<RoomState>): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    try {
      const payload: any = {
        updatedAt: serverTimestamp(),
      };
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.drawnBalls !== undefined) payload.drawnBalls = updates.drawnBalls;
      if (updates.currentBall !== undefined) payload.currentBall = updates.currentBall;
      if (updates.drawSpeedSeconds !== undefined) payload.drawSpeedSeconds = updates.drawSpeedSeconds;
      if (updates.winningRule !== undefined) payload.winningRule = updates.winningRule;
      if (updates.winnerId !== undefined) payload.winnerId = updates.winnerId;
      if (updates.winnerName !== undefined) payload.winnerName = updates.winnerName;

      await updateDoc(roomRef, payload);
    } catch (error) {
      console.warn('Non-blocking room update error in firestore:', error);
    }
  },

  /**
   * Busca sala pelo código de 6 dígitos
   */
  async findRoomByCode(code: string): Promise<RoomState | null> {
    const roomsCol = collection(db, 'rooms');
    const path = 'rooms';
    try {
      const q = query(roomsCol, where('code', '==', code.trim().toUpperCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const data = snap.docs[0].data();
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        hostId: data.hostId,
        mode: data.mode,
        status: data.status,
        drawSpeedSeconds: data.drawSpeedSeconds,
        winningRule: data.winningRule,
        drawnBalls: data.drawnBalls || [],
        currentBall: data.currentBall,
        players: [],
        messages: [],
        winnerId: data.winnerId,
        winnerName: data.winnerName,
        isPrivate: data.isPrivate,
        maxPlayers: data.maxPlayers,
        createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Busca salas abertas públicas do Firestore
   */
  async getOpenRooms(): Promise<PublicRoomSummary[]> {
    const roomsCol = collection(db, 'rooms');
    try {
      const q = query(
        roomsCol,
        where('isPrivate', '==', false),
        limit(25)
      );
      const snap = await getDocs(q);
      const list: PublicRoomSummary[] = [];

      for (const d of snap.docs) {
        const data = d.data();
        list.push({
          id: data.id,
          code: data.code,
          name: data.name,
          hostName: data.hostName || 'Host',
          hostAvatar: data.hostAvatar,
          mode: data.mode,
          modeLabel: data.mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas',
          playerCount: data.playerCount || 1,
          maxPlayers: data.maxPlayers || 50,
          status: data.status,
          isPrivate: false,
          createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
        });
      }

      return list;
    } catch (error) {
      console.warn('Could not query open rooms from Firestore, falling back to local:', error);
      return [];
    }
  },

  /**
   * Monitora em tempo real a sala no Firestore
   */
  subscribeToRoom(roomId: string, callback: (room: Partial<RoomState>) => void): () => void {
    const roomRef = doc(db, 'rooms', roomId);
    return onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            id: data.id,
            code: data.code,
            name: data.name,
            hostId: data.hostId,
            mode: data.mode,
            status: data.status,
            drawSpeedSeconds: data.drawSpeedSeconds,
            winningRule: data.winningRule,
            drawnBalls: data.drawnBalls || [],
            currentBall: data.currentBall,
            winnerId: data.winnerId,
            winnerName: data.winnerName,
            isPrivate: data.isPrivate,
            maxPlayers: data.maxPlayers,
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
      }
    );
  },

  /**
   * Monitora em tempo real todas as cartelas da sala
   * (Usado pelo Master Admin Dashboard e para verificação de vencedores)
   */
  subscribeToRoomCards(
    roomId: string,
    callback: (cards: FirestorePlayerCard[]) => void
  ): () => void {
    const cardsCol = collection(db, 'rooms', roomId, 'cards');
    return onSnapshot(
      cardsCol,
      (snap) => {
        const cards: FirestorePlayerCard[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.id,
            roomId: d.roomId,
            playerId: d.playerId,
            playerName: d.playerName || 'Jogador',
            playerAvatar: d.playerAvatar,
            mode: d.mode,
            numbers: d.numbers || [],
            markedNumbers: d.markedNumbers || [],
            isWinner: !!d.isWinner,
            updatedAt: d.updatedAt,
          };
        });
        callback(cards);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/cards`);
      }
    );
  },

  /**
   * Monitora em tempo real todas as salas (para o Master Admin Dashboard)
   */
  subscribeToAllRoomsForAdmin(
    callback: (rooms: any[]) => void
  ): () => void {
    const roomsCol = collection(db, 'rooms');
    return onSnapshot(
      roomsCol,
      (snap) => {
        const rooms = snap.docs.map((docSnap) => docSnap.data());
        callback(rooms);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'rooms');
      }
    );
  },

  /**
   * Exclui uma sala (ação exclusiva de Master Admin)
   */
  async deleteRoom(roomId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    try {
      await deleteDoc(roomRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}`);
    }
  },

  /**
   * Força chamada ou reset de bingo pelo Master Admin
   */
  async adminForceBingo(roomId: string, winnerId: string, winnerName: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    try {
      await updateDoc(roomRef, {
        status: 'FINISHED',
        winnerId,
        winnerName,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  /**
   * Envia mensagem no chat da sala
   */
  async sendChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    const msgRef = doc(db, 'rooms', roomId, 'messages', message.id);
    try {
      await setDoc(msgRef, {
        id: message.id,
        playerId: message.playerId,
        senderName: message.senderName,
        avatar: message.avatar || '',
        text: message.text,
        timestamp: message.timestamp,
        type: message.type,
      });
    } catch (error) {
      console.warn('Error sending chat message to Firestore:', error);
    }
  },

  /**
   * Monitora mensagens de chat em tempo real
   */
  subscribeToChat(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const msgsCol = collection(db, 'rooms', roomId, 'messages');
    const q = query(msgsCol, orderBy('timestamp', 'asc'), limit(50));
    return onSnapshot(
      q,
      (snap) => {
        const msgs: ChatMessage[] = snap.docs.map((d) => d.data() as ChatMessage);
        callback(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/messages`);
      }
    );
  },
};
