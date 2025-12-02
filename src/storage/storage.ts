/**
 * IndexedDB Storage for RetroSudoku
 * Persistent storage for saved games, stats, and settings
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GameStats, SavedGame, Theme, Difficulty, Cell, Puzzle } from '../types';

interface RetroSudokuDB extends DBSchema {
  savedGames: {
    key: string;
    value: SavedGame;
    indexes: { 'by-date': number };
  };
  stats: {
    key: string;
    value: GameStats;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  dailyPuzzles: {
    key: string;
    value: DailyPuzzle;
  };
}

export interface AppSettings {
  theme: Theme;
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoRemovePencilMarks: boolean;
  highlightConflicts: boolean;
  highlightSameNumbers: boolean;
  showTimer: boolean;
  showHints: boolean;
  darkMode: boolean;
  highContrast: boolean;
  scanlines: boolean;
  crtGlow: boolean;
  volume: number;
}

export interface DailyPuzzle {
  date: string;
  puzzle: Puzzle;
  completed: boolean;
  time?: number;
}

const DB_NAME = 'retrosudoku';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RetroSudokuDB>> | null = null;

/**
 * Initialize database connection
 */
export async function initDB(): Promise<IDBPDatabase<RetroSudokuDB>> {
  if (dbPromise) return dbPromise;
  
  dbPromise = openDB<RetroSudokuDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Saved games store
      if (!db.objectStoreNames.contains('savedGames')) {
        const savedGamesStore = db.createObjectStore('savedGames', { keyPath: 'id' });
        savedGamesStore.createIndex('by-date', 'savedAt');
      }
      
      // Stats store
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats');
      }
      
      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      
      // Daily puzzles store
      if (!db.objectStoreNames.contains('dailyPuzzles')) {
        db.createObjectStore('dailyPuzzles');
      }
    },
  });
  
  return dbPromise;
}

// ============ Saved Games ============

/**
 * Save a game
 */
export async function saveGame(
  puzzle: Puzzle,
  cells: Cell[],
  elapsedTime: number,
  name?: string
): Promise<string> {
  const db = await initDB();
  const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const savedGame: SavedGame = {
    id,
    puzzle,
    cells: cells.map(cell => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
    })),
    elapsedTime,
    savedAt: Date.now(),
    name,
  };
  
  await db.put('savedGames', savedGame);
  return id;
}

/**
 * Load a saved game
 */
export async function loadGame(id: string): Promise<SavedGame | undefined> {
  const db = await initDB();
  const game = await db.get('savedGames', id);
  
  if (game) {
    // Convert pencil marks back to Sets
    game.cells = game.cells.map(cell => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
    }));
  }
  
  return game;
}

/**
 * Get all saved games
 */
export async function getAllSavedGames(): Promise<SavedGame[]> {
  const db = await initDB();
  const games = await db.getAllFromIndex('savedGames', 'by-date');
  
  return games.reverse().map(game => ({
    ...game,
    cells: game.cells.map(cell => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
    })),
  }));
}

/**
 * Delete a saved game
 */
export async function deleteSavedGame(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('savedGames', id);
}

/**
 * Clear all saved games
 */
export async function clearAllSavedGames(): Promise<void> {
  const db = await initDB();
  await db.clear('savedGames');
}

// ============ Stats ============

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimes: {},
  currentStreak: 0,
  longestStreak: 0,
  totalPlayTime: 0,
  achievements: [],
};

/**
 * Get player stats
 */
export async function getStats(): Promise<GameStats> {
  const db = await initDB();
  const stats = await db.get('stats', 'player');
  return stats ?? DEFAULT_STATS;
}

/**
 * Update player stats
 */
export async function updateStats(stats: GameStats): Promise<void> {
  const db = await initDB();
  await db.put('stats', stats, 'player');
}

/**
 * Record a game completion
 */
export async function recordGameCompletion(
  size: number,
  difficulty: Difficulty,
  timeMs: number,
  won: boolean
): Promise<{ newBestTime: boolean; achievement?: string }> {
  const stats = await getStats();
  
  stats.gamesPlayed++;
  stats.totalPlayTime += timeMs;
  
  let newBestTime = false;
  let achievement: string | undefined;
  
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
      
      if (stats.longestStreak === 7 && !stats.achievements.includes('week_streak')) {
        stats.achievements.push('week_streak');
        achievement = 'Week Warrior: 7 day streak!';
      }
      if (stats.longestStreak === 30 && !stats.achievements.includes('month_streak')) {
        stats.achievements.push('month_streak');
        achievement = 'Monthly Master: 30 day streak!';
      }
    }
    
    // Check best time
    const key = `${size}-${difficulty}`;
    const currentBest = stats.bestTimes[key];
    
    if (!currentBest || timeMs < currentBest) {
      stats.bestTimes[key] = timeMs;
      newBestTime = true;
    }
    
    // Achievement checks
    if (stats.gamesWon === 1 && !stats.achievements.includes('first_win')) {
      stats.achievements.push('first_win');
      achievement = 'First Victory!';
    }
    if (stats.gamesWon === 100 && !stats.achievements.includes('century')) {
      stats.achievements.push('century');
      achievement = 'Century Club: 100 wins!';
    }
    if (timeMs < 60000 && difficulty === 'Expert' && !stats.achievements.includes('speed_demon')) {
      stats.achievements.push('speed_demon');
      achievement = 'Speed Demon: Expert in under 1 minute!';
    }
  } else {
    stats.currentStreak = 0;
  }
  
  await updateStats(stats);
  return { newBestTime, achievement };
}

/**
 * Get best time for a size/difficulty
 */
export async function getBestTime(size: number, difficulty: Difficulty): Promise<number | null> {
  const stats = await getStats();
  const key = `${size}-${difficulty}`;
  return stats.bestTimes[key] ?? null;
}

// ============ Settings ============

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'modern',
  soundEnabled: true,
  musicEnabled: false,
  autoRemovePencilMarks: true,
  highlightConflicts: true,
  highlightSameNumbers: true,
  showTimer: true,
  showHints: true,
  darkMode: false,
  highContrast: false,
  scanlines: false,
  crtGlow: false,
  volume: 0.5,
};

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings> {
  const db = await initDB();
  const settings = await db.get('settings', 'app');
  return { ...DEFAULT_SETTINGS, ...settings };
}

/**
 * Update app settings
 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<void> {
  const db = await initDB();
  const current = await getSettings();
  await db.put('settings', { ...current, ...settings }, 'app');
}

// ============ Daily Puzzles ============

/**
 * Get today's date string
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get daily puzzle
 */
export async function getDailyPuzzle(): Promise<DailyPuzzle | undefined> {
  const db = await initDB();
  const today = getTodayString();
  return db.get('dailyPuzzles', today);
}

/**
 * Save daily puzzle
 */
export async function saveDailyPuzzle(puzzle: Puzzle): Promise<void> {
  const db = await initDB();
  const today = getTodayString();
  
  await db.put('dailyPuzzles', {
    date: today,
    puzzle,
    completed: false,
  }, today);
}

/**
 * Complete daily puzzle
 */
export async function completeDailyPuzzle(time: number): Promise<void> {
  const db = await initDB();
  const today = getTodayString();
  const daily = await db.get('dailyPuzzles', today);
  
  if (daily) {
    daily.completed = true;
    daily.time = time;
    await db.put('dailyPuzzles', daily, today);
  }
}

/**
 * Get daily puzzle history
 */
export async function getDailyHistory(days: number = 30): Promise<DailyPuzzle[]> {
  const db = await initDB();
  const puzzles = await db.getAll('dailyPuzzles');
  
  return puzzles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days);
}

// ============ Export/Import ============

/**
 * Export all data
 */
export async function exportAllData(): Promise<string> {
  const stats = await getStats();
  const settings = await getSettings();
  const savedGames = await getAllSavedGames();
  
  return JSON.stringify({
    stats,
    settings,
    savedGames: savedGames.map(game => ({
      ...game,
      cells: game.cells.map(cell => ({
        ...cell,
        pencilMarks: Array.from(cell.pencilMarks),
      })),
    })),
    exportedAt: Date.now(),
  }, null, 2);
}

/**
 * Import all data
 */
export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  
  if (data.stats) {
    await updateStats(data.stats);
  }
  
  if (data.settings) {
    await updateSettings(data.settings);
  }
  
  if (data.savedGames && Array.isArray(data.savedGames)) {
    const db = await initDB();
    for (const game of data.savedGames) {
      game.cells = game.cells.map((cell: any) => ({
        ...cell,
        pencilMarks: new Set(cell.pencilMarks),
      }));
      await db.put('savedGames', game);
    }
  }
}
