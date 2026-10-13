import { BingoMode, WinningRule } from '../types/bingo';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomSubarray<T>(arr: T[], size: number): T[] {
  return shuffle(arr).slice(0, size);
}

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

/**
 * Generate 75-ball bingo card (5 rows x 5 columns)
 * B: 1-15, I: 16-30, N: 31-45 (center free), G: 46-60, O: 61-75
 */
export function generate75Card(): number[][] {
  const colB = getRandomSubarray(range(1, 15), 5);
  const colI = getRandomSubarray(range(16, 30), 5);
  const colN = getRandomSubarray(range(31, 45), 5);
  const colG = getRandomSubarray(range(46, 60), 5);
  const colO = getRandomSubarray(range(61, 75), 5);

  const grid: number[][] = [];
  for (let row = 0; row < 5; row++) {
    grid.push([colB[row], colI[row], colN[row], colG[row], colO[row]]);
  }

  // Free center space
  grid[2][2] = 0; // 0 denotes FREE

  return grid;
}

/**
 * Generate 90-ball bingo card (3 rows x 9 columns)
 * 15 numbers total, 5 per row, 4 blanks per row
 */
export function generate90Card(): number[][] {
  // Columns ranges: 1-9, 10-19, 20-29, 30-39, 40-49, 50-59, 60-69, 70-79, 80-90
  const colRanges = [
    range(1, 9),
    range(10, 19),
    range(20, 29),
    range(30, 39),
    range(40, 49),
    range(50, 59),
    range(60, 69),
    range(70, 79),
    range(80, 90),
  ];

  // Pick 1-3 numbers per column so sum is 15
  // Default balanced distribution: 6 columns with 2 numbers, 3 columns with 1 number = 15 numbers
  const colCounts = [1, 2, 2, 1, 2, 2, 1, 2, 2];
  const shuffledCounts = shuffle(colCounts);

  const numbersByCol: number[][] = [];
  for (let c = 0; c < 9; c++) {
    const picked = getRandomSubarray(colRanges[c], shuffledCounts[c]).sort((a, b) => a - b);
    numbersByCol.push(picked);
  }

  const grid: number[][] = [
    new Array(9).fill(0),
    new Array(9).fill(0),
    new Array(9).fill(0),
  ];

  // Place numbers in rows ensuring each row has exactly 5 numbers
  // First, place into rows ensuring col order
  for (let c = 0; c < 9; c++) {
    const colNums = numbersByCol[c];
    if (colNums.length === 1) {
      // Pick random row that currently has fewest numbers
      const validRows = [0, 1, 2].filter((r) => grid[r].filter((n) => n > 0).length < 5);
      const chosenRow = validRows[Math.floor(Math.random() * validRows.length)] ?? 0;
      grid[chosenRow][c] = colNums[0];
    } else if (colNums.length === 2) {
      const rowPairs = [
        [0, 1],
        [0, 2],
        [1, 2],
      ];
      // Find pair of rows where both have room
      const validPairs = rowPairs.filter(
        ([r1, r2]) =>
          grid[r1].filter((n) => n > 0).length < 5 &&
          grid[r2].filter((n) => n > 0).length < 5
      );
      const chosenPair = validPairs[0] || [0, 1];
      grid[chosenPair[0]][c] = colNums[0];
      grid[chosenPair[1]][c] = colNums[1];
    }
  }

  // Check and balance rows to have 5 numbers each
  for (let r = 0; r < 3; r++) {
    while (grid[r].filter((n) => n > 0).length > 5) {
      // Move a number to another row in the same column if possible
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] > 0) {
          const targetRows = [0, 1, 2].filter(
            (tr) => tr !== r && grid[tr][c] === 0 && grid[tr].filter((n) => n > 0).length < 5
          );
          if (targetRows.length > 0) {
            grid[targetRows[0]][c] = grid[r][c];
            grid[r][c] = 0;
            break;
          }
        }
      }
    }
  }

  return grid;
}

export function get75BallLetter(num: number): 'B' | 'I' | 'N' | 'G' | 'O' {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

export function getBallColor(num: number, mode: BingoMode): string {
  if (mode === 'BINGO_75') {
    const letter = get75BallLetter(num);
    switch (letter) {
      case 'B':
        return '#3b82f6'; // blue
      case 'I':
        return '#ef4444'; // red
      case 'N':
        return '#10b981'; // emerald
      case 'G':
        return '#f59e0b'; // amber
      case 'O':
        return '#8b5cf6'; // purple
    }
  }
  // 90 balls palette by tens
  const tens = Math.floor((num - 1) / 10);
  const colors = [
    '#3b82f6',
    '#06b6d4',
    '#10b981',
    '#84cc16',
    '#eab308',
    '#f97316',
    '#ef4444',
    '#ec4899',
    '#8b5cf6',
  ];
  return colors[tens] || '#64748b';
}

export interface VictoryCheckResult {
  isWinner: boolean;
  patternName: string;
  winningCoordinates: [number, number][];
}

/**
 * Strictly verifies whether marked cells match legitimately drawn balls
 * and satisfy the room's winning rule
 */
export function checkVictory(
  card: number[][],
  marked: boolean[][],
  drawnBalls: number[],
  mode: BingoMode,
  winningRule: WinningRule
): VictoryCheckResult {
  const drawnSet = new Set(drawnBalls);

  // Helper to verify a single cell is marked AND drawn (or free 0 in 75)
  const isCellValid = (r: number, c: number) => {
    const val = card[r]?.[c];
    if (val === undefined) return false;
    if (val === 0) return true; // Free space or empty
    return marked[r]?.[c] === true && drawnSet.has(val);
  };

  const rows = card.length;
  const cols = card[0]?.length || 0;

  // 1. Check Full Card (Cartela Cheia)
  let isFullCard = true;
  const allCoords: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = card[r][c];
      if (val > 0) {
        if (!isCellValid(r, c)) {
          isFullCard = false;
        } else {
          allCoords.push([r, c]);
        }
      }
    }
  }

  if (isFullCard && (winningRule === 'FULL_CARD' || winningRule === 'ANY')) {
    return {
      isWinner: true,
      patternName: 'Cartela Cheia (BINGO!)',
      winningCoordinates: allCoords,
    };
  }

  // 2. Check Rows (Linhas Horizontais)
  for (let r = 0; r < rows; r++) {
    const rowCoords: [number, number][] = [];
    let rowValid = true;
    for (let c = 0; c < cols; c++) {
      const val = card[r][c];
      if (val > 0) {
        if (isCellValid(r, c)) {
          rowCoords.push([r, c]);
        } else {
          rowValid = false;
          break;
        }
      }
    }
    if (rowValid && rowCoords.length > 0) {
      if (winningRule === 'LINE' || winningRule === 'ANY') {
        return {
          isWinner: true,
          patternName: `Linha Horizontal ${r + 1}`,
          winningCoordinates: rowCoords,
        };
      }
    }
  }

  // Mode 75 specific patterns
  if (mode === 'BINGO_75') {
    // 3. Check Columns (Colunas)
    for (let c = 0; c < 5; c++) {
      const colCoords: [number, number][] = [];
      let colValid = true;
      for (let r = 0; r < 5; r++) {
        if (isCellValid(r, c)) {
          colCoords.push([r, c]);
        } else {
          colValid = false;
          break;
        }
      }
      if (colValid) {
        if (winningRule === 'LINE' || winningRule === 'ANY') {
          const letter = ['B', 'I', 'N', 'G', 'O'][c];
          return {
            isWinner: true,
            patternName: `Coluna ${letter}`,
            winningCoordinates: colCoords,
          };
        }
      }
    }

    // 4. Check Diagonals
    let diag1Valid = true;
    const diag1Coords: [number, number][] = [];
    let diag2Valid = true;
    const diag2Coords: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      if (isCellValid(i, i)) {
        diag1Coords.push([i, i]);
      } else {
        diag1Valid = false;
      }
      if (isCellValid(i, 4 - i)) {
        diag2Coords.push([i, 4 - i]);
      } else {
        diag2Valid = false;
      }
    }
    if (diag1Valid && (winningRule === 'LINE' || winningRule === 'ANY')) {
      return {
        isWinner: true,
        patternName: 'Diagonal Principal',
        winningCoordinates: diag1Coords,
      };
    }
    if (diag2Valid && (winningRule === 'LINE' || winningRule === 'ANY')) {
      return {
        isWinner: true,
        patternName: 'Diagonal Secundária',
        winningCoordinates: diag2Coords,
      };
    }

    // 5. Four Corners (Quatro Cantos)
    const corners: [number, number][] = [
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
    ];
    const cornersValid = corners.every(([r, c]) => isCellValid(r, c));
    if (cornersValid && (winningRule === 'CORNERS' || winningRule === 'ANY')) {
      return {
        isWinner: true,
        patternName: 'Quatro Cantos',
        winningCoordinates: corners,
      };
    }
  }

  return {
    isWinner: false,
    patternName: '',
    winningCoordinates: [],
  };
}
