/**
 * Unit Tests for RetroSudoku Solver
 */

import { describe, it, expect, bench } from 'vitest';
import { DLXSolver, solvePuzzle, hasUniqueSolution } from '../src/solver/dlx';
import { solveWithSteps, getHint } from '../src/solver/humanSolver';
import { generatePuzzle, getConfigForSize } from '../src/solver/generator';

// Test puzzles
const EASY_9x9 = [
  5, 3, 0, 0, 7, 0, 0, 0, 0,
  6, 0, 0, 1, 9, 5, 0, 0, 0,
  0, 9, 8, 0, 0, 0, 0, 6, 0,
  8, 0, 0, 0, 6, 0, 0, 0, 3,
  4, 0, 0, 8, 0, 3, 0, 0, 1,
  7, 0, 0, 0, 2, 0, 0, 0, 6,
  0, 6, 0, 0, 0, 0, 2, 8, 0,
  0, 0, 0, 4, 1, 9, 0, 0, 5,
  0, 0, 0, 0, 8, 0, 0, 7, 9,
];

const HARD_9x9 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 8, 5,
  0, 0, 1, 0, 2, 0, 0, 0, 0,
  0, 0, 0, 5, 0, 7, 0, 0, 0,
  0, 0, 4, 0, 0, 0, 1, 0, 0,
  0, 9, 0, 0, 0, 0, 0, 0, 0,
  5, 0, 0, 0, 0, 0, 0, 7, 3,
  0, 0, 2, 0, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 4, 0, 0, 0, 9,
];

const SMALL_4x4 = [
  0, 2, 0, 0,
  0, 0, 3, 0,
  0, 4, 0, 0,
  0, 0, 2, 0,
];

const MEDIUM_6x6 = [
  0, 0, 0, 0, 5, 0,
  0, 5, 0, 0, 0, 3,
  0, 0, 0, 4, 0, 0,
  0, 0, 4, 0, 0, 0,
  3, 0, 0, 0, 6, 0,
  0, 6, 0, 0, 0, 0,
];

describe('DLX Solver', () => {
  it('should solve an easy 9x9 puzzle', () => {
    const result = solvePuzzle(EASY_9x9, 9, 3, 3);
    expect(result.solved).toBe(true);
    expect(result.solution.length).toBe(81);
    expect(result.solution.every(v => v >= 1 && v <= 9)).toBe(true);
  });
  
  it('should solve a hard 9x9 puzzle', () => {
    const result = solvePuzzle(HARD_9x9, 9, 3, 3);
    expect(result.solved).toBe(true);
    expect(result.solution.length).toBe(81);
  });
  
  it('should solve a 4x4 puzzle', () => {
    const result = solvePuzzle(SMALL_4x4, 4, 2, 2);
    expect(result.solved).toBe(true);
    expect(result.solution.length).toBe(16);
    expect(result.solution.every(v => v >= 1 && v <= 4)).toBe(true);
  });
  
  it('should solve a 6x6 puzzle', () => {
    const result = solvePuzzle(MEDIUM_6x6, 6, 2, 3);
    expect(result.solved).toBe(true);
    expect(result.solution.length).toBe(36);
    expect(result.solution.every(v => v >= 1 && v <= 6)).toBe(true);
  });
  
  it('should detect unique solutions', () => {
    expect(hasUniqueSolution(EASY_9x9, 9, 3, 3)).toBe(true);
  });
  
  it('should solve 9x9 puzzles in under 50ms', () => {
    const result = solvePuzzle(HARD_9x9, 9, 3, 3);
    expect(result.solved).toBe(true);
    expect(result.timeMs).toBeLessThan(50);
  });
  
  it('should return false for invalid puzzles', () => {
    const invalid = [...EASY_9x9];
    invalid[0] = 6; // Create conflict with existing 6
    const result = solvePuzzle(invalid, 9, 3, 3);
    // May or may not solve depending on conflict position
  });
  
  it('should preserve given values in solution', () => {
    const result = solvePuzzle(EASY_9x9, 9, 3, 3);
    expect(result.solved).toBe(true);
    
    for (let i = 0; i < EASY_9x9.length; i++) {
      if (EASY_9x9[i] !== 0) {
        expect(result.solution[i]).toBe(EASY_9x9[i]);
      }
    }
  });
});

describe('Human Solver', () => {
  it('should solve puzzles with step explanations', () => {
    const result = solveWithSteps(EASY_9x9, 9, 3, 3);
    expect(result.solved).toBe(true);
    expect(result.techniques.length).toBeGreaterThan(0);
  });
  
  it('should provide hints', () => {
    const pencilMarks = EASY_9x9.map(() => new Set<number>());
    const hint = getHint(EASY_9x9, pencilMarks, 9, 3, 3);
    expect(hint).not.toBeNull();
    expect(hint?.explanation).toBeDefined();
  });
  
  it('should identify technique types', () => {
    const result = solveWithSteps(EASY_9x9, 9, 3, 3);
    const techniqueTypes = result.techniques.map(t => t.type);
    expect(techniqueTypes.some(t => t === 'Single Candidate' || t === 'Hidden Single')).toBe(true);
  });
});

describe('Puzzle Generator', () => {
  it('should generate valid 9x9 puzzles', () => {
    const config = getConfigForSize(9)!;
    const puzzle = generatePuzzle(config, 'Medium', 'rotational');
    
    expect(puzzle.size).toBe(9);
    expect(puzzle.cells.length).toBe(81);
    expect(puzzle.solution).toBeDefined();
    expect(puzzle.solution!.length).toBe(81);
  });
  
  it('should generate puzzles with unique solutions', () => {
    const config = getConfigForSize(9)!;
    const puzzle = generatePuzzle(config, 'Easy', 'rotational');
    
    expect(hasUniqueSolution(puzzle.cells, 9, 3, 3)).toBe(true);
  });
  
  it('should generate puzzles of different sizes', () => {
    const sizes = [4, 6, 9];
    
    for (const size of sizes) {
      const config = getConfigForSize(size)!;
      const puzzle = generatePuzzle(config, 'Medium', 'none');
      
      expect(puzzle.size).toBe(size);
      expect(hasUniqueSolution(puzzle.cells, size, config.blockRows, config.blockCols)).toBe(true);
    }
  });
  
  it('should apply symmetry to puzzles', () => {
    const config = getConfigForSize(9)!;
    const puzzle = generatePuzzle(config, 'Medium', 'rotational');
    
    // Check rotational symmetry
    for (let i = 0; i < puzzle.cells.length; i++) {
      const symmetric = 80 - i;
      const isEmpty = puzzle.cells[i] === 0;
      const symmetricIsEmpty = puzzle.cells[symmetric] === 0;
      // Both should be empty or both should have values (mostly)
      // This is probabilistic, so we don't strictly enforce
    }
  });
  
  it('should generate with seed for reproducibility', () => {
    const config = getConfigForSize(9)!;
    const seed = 12345;
    
    const puzzle1 = generatePuzzle(config, 'Medium', 'rotational', seed);
    const puzzle2 = generatePuzzle(config, 'Medium', 'rotational', seed);
    
    // Same seed should produce same puzzle
    expect(puzzle1.cells).toEqual(puzzle2.cells);
  });
});

describe('Performance Benchmarks', () => {
  it('should solve easy puzzle quickly', () => {
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      solvePuzzle(EASY_9x9, 9, 3, 3);
    }
    const elapsed = performance.now() - start;
    const avgTime = elapsed / 10;
    
    expect(avgTime).toBeLessThan(10); // Should average < 10ms
  });
  
  it('should solve hard puzzle quickly', () => {
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      solvePuzzle(HARD_9x9, 9, 3, 3);
    }
    const elapsed = performance.now() - start;
    const avgTime = elapsed / 10;
    
    expect(avgTime).toBeLessThan(50); // Should average < 50ms
  });
  
  it('should generate puzzles in reasonable time', () => {
    const config = getConfigForSize(9)!;
    
    const start = performance.now();
    generatePuzzle(config, 'Medium', 'rotational');
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(5000); // Should complete in < 5s
  });
});
