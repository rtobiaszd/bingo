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

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  themeId: string;
  markerId: string;
  cardNumbers: number[][]; // 5x5 (75) or 3x9 (90)
  markedCells: boolean[][];
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
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

export interface RoomState {
  id: string;
  code: string;
  name: string;
  hostId: string;
  mode: BingoMode;
  status: RoomStatus;
  drawSpeedSeconds: number; // 3 to 10
  winningRule: WinningRule;
  drawnBalls: number[];
  currentBall: number | null;
  previousBalls: number[];
  players: Record<string, PlayerProfile>;
  chat: ChatMessage[];
  winner: WinnerAudit | null;
  createdAt: number;
  startedAt: number | null;
}
