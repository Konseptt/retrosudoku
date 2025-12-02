/**
 * Puzzle Generator for RetroSudoku
 * Generates puzzles with configurable size, difficulty, and symmetry
 * Guarantees unique solutions
 */

import { Puzzle, Difficulty, Symmetry, PuzzleConfig, DIFFICULTY_SETTINGS, SUPPORTED_SIZES } from '../types';
import { DLXSolver, hasUniqueSolution } from './dlx';
import { solveWithSteps } from './humanSolver';

/**
 * Seeded random number generator for reproducible puzzles
 */
class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getSeed(): number {
    return this.seed;
  }
}

/**
 * Generate a complete valid Sudoku solution
 */
function generateSolution(
  size: number,
  blockRows: number,
  blockCols: number,
  rng: SeededRandom
): number[] {
  const grid = new Array(size * size).fill(0);
  
  // Fill the grid using backtracking with randomization
  function fillGrid(index: number): boolean {
    if (index >= size * size) return true;
    
    const row = Math.floor(index / size);
    const col = index % size;
    
    const candidates = rng.shuffle(Array.from({ length: size }, (_, i) => i + 1));
    
    for (const num of candidates) {
      if (isValidPlacement(grid, row, col, num, size, blockRows, blockCols)) {
        grid[index] = num;
        if (fillGrid(index + 1)) return true;
        grid[index] = 0;
      }
    }
    
    return false;
  }
  
  fillGrid(0);
  return grid;
}

/**
 * Check if placing a number is valid
 */
function isValidPlacement(
  grid: number[],
  row: number,
  col: number,
  num: number,
  size: number,
  blockRows: number,
  blockCols: number
): boolean {
  // Check row
  for (let c = 0; c < size; c++) {
    if (grid[row * size + c] === num) return false;
  }
  
  // Check column
  for (let r = 0; r < size; r++) {
    if (grid[r * size + col] === num) return false;
  }
  
  // Check box
  const boxStartRow = Math.floor(row / blockRows) * blockRows;
  const boxStartCol = Math.floor(col / blockCols) * blockCols;
  for (let r = boxStartRow; r < boxStartRow + blockRows; r++) {
    for (let c = boxStartCol; c < boxStartCol + blockCols; c++) {
      if (grid[r * size + c] === num) return false;
    }
  }
  
  return true;
}

/**
 * Get symmetric cell indices based on symmetry type
 */
function getSymmetricCells(
  index: number,
  size: number,
  symmetry: Symmetry
): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const cells = [index];
  
  switch (symmetry) {
    case 'rotational':
      cells.push((size - 1 - row) * size + (size - 1 - col));
      break;
    case 'horizontal':
      cells.push(row * size + (size - 1 - col));
      break;
    case 'vertical':
      cells.push((size - 1 - row) * size + col);
      break;
    case 'diagonal':
      cells.push(col * size + row);
      if (row !== col) {
        cells.push((size - 1 - col) * size + (size - 1 - row));
        cells.push((size - 1 - row) * size + (size - 1 - col));
      }
      break;
    case 'none':
    default:
      break;
  }
  
  return [...new Set(cells)];
}

/**
 * Calculate difficulty score based on techniques needed
 */
function assessDifficulty(
  puzzle: number[],
  size: number,
  blockRows: number,
  blockCols: number
): { difficulty: Difficulty; score: number } {
  const result = solveWithSteps(puzzle, size, blockRows, blockCols);
  
  if (!result.solved) {
    return { difficulty: 'Expert', score: 100 };
  }
  
  let score = 0;
  const techniqueCounts: Record<string, number> = {};
  
  for (const step of result.techniques) {
    techniqueCounts[step.type] = (techniqueCounts[step.type] || 0) + 1;
    
    switch (step.type) {
      case 'Single Candidate':
        score += 1;
        break;
      case 'Hidden Single':
        score += 2;
        break;
      case 'Naked Pair':
        score += 4;
        break;
      case 'Hidden Pair':
        score += 5;
        break;
      case 'Pointing Pair':
        score += 4;
        break;
      case 'X-Wing':
        score += 8;
        break;
      default:
        score += 10;
    }
  }
  
  const hasAdvanced = techniqueCounts['X-Wing'] > 0;
  const hasIntermediate = (techniqueCounts['Naked Pair'] || 0) + (techniqueCounts['Hidden Pair'] || 0) > 0;
  
  let difficulty: Difficulty;
  if (hasAdvanced || score > 150) {
    difficulty = 'Expert';
  } else if (hasIntermediate || score > 80) {
    difficulty = 'Hard';
  } else if (score > 40) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Easy';
  }
  
  return { difficulty, score };
}

/**
 * Adjust givens count based on grid size
 */
function getGivensRange(size: number, difficulty: Difficulty): { min: number; max: number } {
  const baseSettings = DIFFICULTY_SETTINGS[difficulty];
  const ratio = size / 9;
  const sizeFactor = ratio * ratio;
  
  return {
    min: Math.round(baseSettings.minGivens * sizeFactor),
    max: Math.round(baseSettings.maxGivens * sizeFactor),
  };
}

/**
 * Generate a puzzle with specified parameters
 */
export function generatePuzzle(
  config: PuzzleConfig,
  difficulty: Difficulty = 'Medium',
  symmetry: Symmetry = 'rotational',
  seed?: number,
  targetGivens?: number
): Puzzle {
  const { size, blockRows, blockCols } = config;
  const rng = new SeededRandom(seed);
  const actualSeed = rng.getSeed();
  
  // Generate complete solution
  const solution = generateSolution(size, blockRows, blockCols, rng);
  
  // Start with full grid and remove cells
  const puzzle = [...solution];
  const totalCells = size * size;
  const givensRange = getGivensRange(size, difficulty);
  
  // Determine target givens
  const targetCount = targetGivens ?? rng.nextInt(givensRange.min, givensRange.max);
  
  // Get cells to potentially remove
  let cellsToTry = rng.shuffle(Array.from({ length: totalCells }, (_, i) => i));
  const removedCells = new Set<number>();
  
  // Adjust based on symmetry
  if (symmetry !== 'none') {
    const processed = new Set<number>();
    const groupedCells: number[][] = [];
    
    for (const cell of cellsToTry) {
      if (!processed.has(cell)) {
        const symmetricGroup = getSymmetricCells(cell, size, symmetry);
        groupedCells.push(symmetricGroup);
        for (const c of symmetricGroup) {
          processed.add(c);
        }
      }
    }
    
    cellsToTry = rng.shuffle(groupedCells).flat();
  }
  
  // Remove cells while maintaining uniqueness
  for (const cellIndex of cellsToTry) {
    if (removedCells.has(cellIndex)) continue;
    
    const givensLeft = totalCells - removedCells.size;
    if (givensLeft <= targetCount) break;
    
    // Get symmetric cells
    const cellsToRemove = symmetry === 'none' 
      ? [cellIndex]
      : getSymmetricCells(cellIndex, size, symmetry).filter(c => !removedCells.has(c));
    
    if (cellsToRemove.length === 0) continue;
    
    // Check if removing these cells would leave too few givens
    if (givensLeft - cellsToRemove.length < givensRange.min) continue;
    
    // Save current values and try removal
    const savedValues = cellsToRemove.map(c => puzzle[c]);
    for (const c of cellsToRemove) {
      puzzle[c] = 0;
    }
    
    // Check uniqueness
    if (hasUniqueSolution(puzzle, size, blockRows, blockCols)) {
      for (const c of cellsToRemove) {
        removedCells.add(c);
      }
    } else {
      // Restore values
      for (let i = 0; i < cellsToRemove.length; i++) {
        puzzle[cellsToRemove[i]] = savedValues[i];
      }
    }
  }
  
  // Assess final difficulty
  const assessment = assessDifficulty(puzzle, size, blockRows, blockCols);
  
  return {
    size,
    blockRows,
    blockCols,
    cells: puzzle,
    difficulty: assessment.difficulty,
    symmetry,
    seed: actualSeed,
    solution,
  };
}

/**
 * Generate a puzzle targeting specific difficulty
 */
export function generatePuzzleWithDifficulty(
  config: PuzzleConfig,
  targetDifficulty: Difficulty,
  symmetry: Symmetry = 'rotational',
  maxAttempts: number = 10
): Puzzle {
  const difficultyOrder: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];
  const targetIndex = difficultyOrder.indexOf(targetDifficulty);
  
  let bestPuzzle: Puzzle | null = null;
  let bestDiffDelta = Infinity;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const puzzle = generatePuzzle(config, targetDifficulty, symmetry);
    const actualIndex = difficultyOrder.indexOf(puzzle.difficulty);
    const diffDelta = Math.abs(actualIndex - targetIndex);
    
    if (diffDelta < bestDiffDelta) {
      bestPuzzle = puzzle;
      bestDiffDelta = diffDelta;
    }
    
    if (puzzle.difficulty === targetDifficulty) {
      return puzzle;
    }
  }
  
  // Return best match, but with the actual difficulty
  return bestPuzzle!;
}

/**
 * Get a random supported puzzle config
 */
export function getRandomConfig(): PuzzleConfig {
  const configs = SUPPORTED_SIZES;
  return configs[Math.floor(Math.random() * configs.length)];
}

/**
 * Get config for a specific size
 */
export function getConfigForSize(size: number): PuzzleConfig | null {
  return SUPPORTED_SIZES.find(c => c.size === size) ?? null;
}

/**
 * Encode puzzle to shareable string
 */
export function encodePuzzle(puzzle: Puzzle): string {
  const data = {
    s: puzzle.size,
    br: puzzle.blockRows,
    bc: puzzle.blockCols,
    c: puzzle.cells.join(''),
    d: puzzle.difficulty[0],
    y: puzzle.symmetry[0],
    sd: puzzle.seed,
  };
  
  return btoa(JSON.stringify(data));
}

/**
 * Decode puzzle from shareable string
 */
export function decodePuzzle(encoded: string): Puzzle | null {
  try {
    const data = JSON.parse(atob(encoded));
    
    const difficultyMap: Record<string, Difficulty> = {
      E: 'Easy',
      M: 'Medium',
      H: 'Hard',
      X: 'Expert',
      C: 'Custom',
    };
    
    const symmetryMap: Record<string, Symmetry> = {
      n: 'none',
      r: 'rotational',
      h: 'horizontal',
      v: 'vertical',
      d: 'diagonal',
    };
    
    const cells = data.c.split('').map((c: string) => parseInt(c, 36) || 0);
    
    // Regenerate solution
    const solver = new DLXSolver(data.s, data.br, data.bc);
    const result = solver.solve(cells);
    
    return {
      size: data.s,
      blockRows: data.br,
      blockCols: data.bc,
      cells,
      difficulty: difficultyMap[data.d] || 'Medium',
      symmetry: symmetryMap[data.y] || 'rotational',
      seed: data.sd,
      solution: result.solution,
    };
  } catch {
    return null;
  }
}

/**
 * Export puzzle as JSON
 */
export function exportPuzzleJson(puzzle: Puzzle): string {
  return JSON.stringify({
    size: puzzle.size,
    blockRows: puzzle.blockRows,
    blockCols: puzzle.blockCols,
    cells: puzzle.cells,
    difficulty: puzzle.difficulty,
    symmetry: puzzle.symmetry,
    seed: puzzle.seed,
  }, null, 2);
}

/**
 * Import puzzle from JSON
 */
export function importPuzzleJson(json: string): Puzzle | null {
  try {
    const data = JSON.parse(json);
    
    if (!data.size || !data.cells || !Array.isArray(data.cells)) {
      return null;
    }
    
    const solver = new DLXSolver(data.size, data.blockRows || 3, data.blockCols || 3);
    const result = solver.solve(data.cells);
    
    return {
      size: data.size,
      blockRows: data.blockRows || 3,
      blockCols: data.blockCols || 3,
      cells: data.cells,
      difficulty: data.difficulty || 'Medium',
      symmetry: data.symmetry || 'none',
      seed: data.seed,
      solution: result.solution,
    };
  } catch {
    return null;
  }
}
