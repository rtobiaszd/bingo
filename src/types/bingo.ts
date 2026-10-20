export type BingoMode = 'BINGO_75' | 'BINGO_90';

export type WinningRule = 'FULL_CARD' | 'LINE' | 'CORNERS' | 'ANY';

export type RoomStatus = 'WAITING' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export interface MarkerStyle {
  id: string;
  name: string;
  iconName: 'fill' | 'dot' | 'check' | 'ring' | 'cross' | 'circle' | 'clover' | 'star' | 'heart' | 'stamp' | 'flame';
  color: string;
}

export interface CardTheme {
  id: string;
  name: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerText: string;
  cellBg: string;
  cellText: string;
  cellBorder: string;
  markedBg: string;
  markedText: string;
  accent: string;
}

export interface BingoCard {
  id: string;
  numbers: (number | null)[][];
  markedNumbers?: number[];
  isWinner?: boolean;
  mode?: 'BINGO_75' | 'BINGO_90';
  playerName?: string;
  playerAvatar?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot?: boolean;
  themeId: string;
  markerId: string;
  cardNumbers: number[][]; // 5x5 (75) or 3x9 (90)
  markedCells: boolean[][];
  joinedAt: number;
}

export interface RegisteredPlayer {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  email?: string;
  phone?: string;
  city?: string;
  luckyNumber?: number;
  gamesPlayed: number;
  bingoWins: number;
  registeredAt: string;
  isGoogleAuth?: boolean;
}

export interface PrizeItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  estimatedValue?: string;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  playerId?: string;
  avatar?: string;
  type?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isBingoCall?: boolean;
  reaction?: string;
}

export interface WinnerAudit {
  winnerId: string;
  winnerName: string;
  winnerAvatar: string;
  winningPattern: string; // e.g. "Cartela Cheia", "Linha Horizontal 2", "Quatro Cantos"
  verifiedBalls: number[];
  timestamp: number;
}

export interface PublicRoomSummary {
  id: string;
  code: string;
  name: string;
  hostName: string;
  hostAvatar?: string;
  mode: BingoMode;
  modeLabel: string;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
  isPrivate: boolean;
  winningRule: WinningRule;
  drawSpeedSeconds: number;
  prizeTitle?: string;
  prizeImageUrl?: string;
  createdAt: number;
}

export interface RoomState {
  id: string;
  code: string;
  name: string;
  hostId: string;
  mode: BingoMode;
  status: RoomStatus;
  drawSpeedSeconds: number; // 3 to 10
  winningRule: WinningRule;
  isPrivate?: boolean; // false = open public room in browser list; true = private room with code only
  maxPlayers?: number;
  prizeId?: string;
  prizeTitle?: string;
  prizeImageUrl?: string;
  prizeDescription?: string;
  winnerId?: string | null;
  winnerName?: string | null;
  drawnBalls: number[];
  currentBall: number | null;
  previousBalls: number[];
  players: Record<string, PlayerProfile>;
  chat: ChatMessage[];
  winner: WinnerAudit | null;
  createdAt: number;
  startedAt: number | null;
}
