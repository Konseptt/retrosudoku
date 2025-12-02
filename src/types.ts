// Core types for RetroSudoku

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
export type Symmetry = 'none' | 'rotational' | 'horizontal' | 'vertical' | 'diagonal';
export type Theme = 'retro' | 'modern' | 'arcade' | 'terminal' | 'cassette';

export interface PuzzleConfig {
  size: number;
  blockRows: number;
  blockCols: number;
}

export interface Puzzle {
  size: number;
  blockRows: number;
  blockCols: number;
  cells: number[];
  difficulty: Difficulty;
  symmetry: Symmetry;
  seed?: number;
  solution?: number[];
}

export interface Cell {
  value: number;
  given: boolean;
  pencilMarks: Set<number>;
  isConflict: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
}

export interface GameState {
  puzzle: Puzzle;
  cells: Cell[];
  history: HistoryEntry[];
  historyIndex: number;
  selectedCell: number | null;
  isPencilMode: boolean;
  isComplete: boolean;
  startTime: number;
  elapsedTime: number;
  isPaused: boolean;
}

export interface HistoryEntry {
  cellIndex: number;
  previousValue: number;
  previousPencilMarks: number[];
  newValue: number;
  newPencilMarks: number[];
}

export type TechniqueType = 
  | 'Single Candidate'
  | 'Hidden Single'
  | 'Naked Pair'
  | 'Hidden Pair'
  | 'Naked Triple'
  | 'Hidden Triple'
  | 'X-Wing'
  | 'Pointing Pair'
  | 'Box/Line Reduction'
  | 'Backtracking';

export interface SolveStep {
  step: number;
  type: TechniqueType;
  cells: number[];
  values: number[];
  eliminatedCandidates?: { cell: number; values: number[] }[];
  explanation: string;
}

export interface SolverResult {
  solved: boolean;
  solution: number[];
  timeMs: number;
  techniques: SolveStep[];
  difficulty?: Difficulty;
}

export interface HintResult {
  type: TechniqueType;
  cells: number[];
  values: number[];
  explanation: string;
  action: 'place' | 'eliminate';
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimes: Record<string, number>; // key: `${size}-${difficulty}`
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number;
  achievements: string[];
}

export interface SavedGame {
  id: string;
  puzzle: Puzzle;
  cells: Cell[];
  elapsedTime: number;
  savedAt: number;
  name?: string;
}

export const SUPPORTED_SIZES: PuzzleConfig[] = [
  { size: 4, blockRows: 2, blockCols: 2 },
  { size: 6, blockRows: 2, blockCols: 3 },
  { size: 9, blockRows: 3, blockCols: 3 },
  { size: 12, blockRows: 3, blockCols: 4 },
  { size: 16, blockRows: 4, blockCols: 4 },
];

export const DIFFICULTY_SETTINGS: Record<Difficulty, { minGivens: number; maxGivens: number; techniques: TechniqueType[] }> = {
  Easy: { minGivens: 36, maxGivens: 45, techniques: ['Single Candidate', 'Hidden Single'] },
  Medium: { minGivens: 30, maxGivens: 36, techniques: ['Single Candidate', 'Hidden Single', 'Naked Pair'] },
  Hard: { minGivens: 25, maxGivens: 30, techniques: ['Single Candidate', 'Hidden Single', 'Naked Pair', 'Hidden Pair', 'Pointing Pair'] },
  Expert: { minGivens: 17, maxGivens: 25, techniques: ['Single Candidate', 'Hidden Single', 'Naked Pair', 'Hidden Pair', 'X-Wing', 'Naked Triple'] },
  Custom: { minGivens: 17, maxGivens: 45, techniques: [] },
};
