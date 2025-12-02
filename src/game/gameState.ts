/**
 * Game State Management for RetroSudoku
 * Handles game logic, history, conflicts, and game state
 */

import { Cell, GameState, HistoryEntry, Puzzle } from '../types';
import { getPeers, solvePuzzle } from '../solver';

/**
 * Initialize cells from puzzle
 */
export function initializeCells(puzzle: Puzzle): Cell[] {
  return puzzle.cells.map((value) => ({
    value,
    given: value !== 0,
    pencilMarks: new Set<number>(),
    isConflict: false,
    isHighlighted: false,
    isSelected: false,
  }));
}

/**
 * Create initial game state
 */
export function createGameState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    cells: initializeCells(puzzle),
    history: [],
    historyIndex: -1,
    selectedCell: null,
    isPencilMode: false,
    isComplete: false,
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
  };
}

/**
 * Find all conflicts in the grid
 */
export function findConflicts(
  cells: Cell[],
  size: number,
  blockRows: number,
  blockCols: number
): Set<number> {
  const conflicts = new Set<number>();
  
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].value === 0) continue;
    
    const peers = getPeers(i, size, blockRows, blockCols);
    for (const peer of peers) {
      if (cells[peer].value === cells[i].value) {
        conflicts.add(i);
        conflicts.add(peer);
      }
    }
  }
  
  return conflicts;
}

/**
 * Update conflict status for all cells
 */
export function updateConflicts(state: GameState): Cell[] {
  const { cells, puzzle } = state;
  const conflicts = findConflicts(cells, puzzle.size, puzzle.blockRows, puzzle.blockCols);
  
  return cells.map((cell, index) => ({
    ...cell,
    isConflict: conflicts.has(index),
  }));
}

/**
 * Check if puzzle is complete (all cells filled correctly)
 */
export function checkCompletion(state: GameState): boolean {
  const { cells, puzzle } = state;
  
  // Check if all cells are filled
  if (cells.some(cell => cell.value === 0)) {
    return false;
  }
  
  // Check for conflicts
  const conflicts = findConflicts(cells, puzzle.size, puzzle.blockRows, puzzle.blockCols);
  if (conflicts.size > 0) {
    return false;
  }
  
  // Optional: verify against solution
  if (puzzle.solution) {
    return cells.every((cell, index) => cell.value === puzzle.solution![index]);
  }
  
  return true;
}

/**
 * Set a cell value with history tracking
 */
export function setCellValue(
  state: GameState,
  cellIndex: number,
  value: number
): GameState {
  const cell = state.cells[cellIndex];
  
  // Can't modify given cells
  if (cell.given) {
    return state;
  }
  
  // Create history entry
  const historyEntry: HistoryEntry = {
    cellIndex,
    previousValue: cell.value,
    previousPencilMarks: Array.from(cell.pencilMarks),
    newValue: value,
    newPencilMarks: [],
  };
  
  // Update cells
  const newCells = state.cells.map((c, i) => {
    if (i === cellIndex) {
      return {
        ...c,
        value,
        pencilMarks: new Set<number>(),
      };
    }
    return c;
  });
  
  // Truncate future history if we're in the middle
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(historyEntry);
  
  const newState: GameState = {
    ...state,
    cells: newCells,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
  
  // Update conflicts
  newState.cells = updateConflicts(newState);
  
  // Check completion
  newState.isComplete = checkCompletion(newState);
  
  return newState;
}

/**
 * Toggle a pencil mark
 */
export function togglePencilMark(
  state: GameState,
  cellIndex: number,
  value: number
): GameState {
  const cell = state.cells[cellIndex];
  
  // Can't modify given cells or cells with values
  if (cell.given || cell.value !== 0) {
    return state;
  }
  
  const newPencilMarks = new Set(cell.pencilMarks);
  if (newPencilMarks.has(value)) {
    newPencilMarks.delete(value);
  } else {
    newPencilMarks.add(value);
  }
  
  // Create history entry
  const historyEntry: HistoryEntry = {
    cellIndex,
    previousValue: 0,
    previousPencilMarks: Array.from(cell.pencilMarks),
    newValue: 0,
    newPencilMarks: Array.from(newPencilMarks),
  };
  
  // Update cells
  const newCells = state.cells.map((c, i) => {
    if (i === cellIndex) {
      return {
        ...c,
        pencilMarks: newPencilMarks,
      };
    }
    return c;
  });
  
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(historyEntry);
  
  return {
    ...state,
    cells: newCells,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

/**
 * Clear a cell
 */
export function clearCell(state: GameState, cellIndex: number): GameState {
  const cell = state.cells[cellIndex];
  
  if (cell.given) {
    return state;
  }
  
  // Create history entry
  const historyEntry: HistoryEntry = {
    cellIndex,
    previousValue: cell.value,
    previousPencilMarks: Array.from(cell.pencilMarks),
    newValue: 0,
    newPencilMarks: [],
  };
  
  const newCells = state.cells.map((c, i) => {
    if (i === cellIndex) {
      return {
        ...c,
        value: 0,
        pencilMarks: new Set<number>(),
      };
    }
    return c;
  });
  
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(historyEntry);
  
  const newState: GameState = {
    ...state,
    cells: newCells,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    isComplete: false,
  };
  
  newState.cells = updateConflicts(newState);
  
  return newState;
}

/**
 * Undo last action
 */
export function undo(state: GameState): GameState {
  if (state.historyIndex < 0) {
    return state;
  }
  
  const entry = state.history[state.historyIndex];
  
  const newCells = state.cells.map((c, i) => {
    if (i === entry.cellIndex) {
      return {
        ...c,
        value: entry.previousValue,
        pencilMarks: new Set(entry.previousPencilMarks),
      };
    }
    return c;
  });
  
  const newState: GameState = {
    ...state,
    cells: newCells,
    historyIndex: state.historyIndex - 1,
    isComplete: false,
  };
  
  newState.cells = updateConflicts(newState);
  
  return newState;
}

/**
 * Redo last undone action
 */
export function redo(state: GameState): GameState {
  if (state.historyIndex >= state.history.length - 1) {
    return state;
  }
  
  const entry = state.history[state.historyIndex + 1];
  
  const newCells = state.cells.map((c, i) => {
    if (i === entry.cellIndex) {
      return {
        ...c,
        value: entry.newValue,
        pencilMarks: new Set(entry.newPencilMarks),
      };
    }
    return c;
  });
  
  const newState: GameState = {
    ...state,
    cells: newCells,
    historyIndex: state.historyIndex + 1,
  };
  
  newState.cells = updateConflicts(newState);
  newState.isComplete = checkCompletion(newState);
  
  return newState;
}

/**
 * Auto-solve the puzzle
 */
export function autoSolve(state: GameState): { state: GameState; timeMs: number } {
  const { puzzle } = state;
  
  const result = solvePuzzle(
    puzzle.cells,
    puzzle.size,
    puzzle.blockRows,
    puzzle.blockCols
  );
  
  if (!result.solved) {
    return { state, timeMs: result.timeMs };
  }
  
  const newCells = state.cells.map((cell, index) => ({
    ...cell,
    value: result.solution[index],
    pencilMarks: new Set<number>(),
    isConflict: false,
  }));
  
  return {
    state: {
      ...state,
      cells: newCells,
      isComplete: true,
    },
    timeMs: result.timeMs,
  };
}

/**
 * Fill all pencil marks with valid candidates
 */
export function fillAllPencilMarks(state: GameState): GameState {
  const { cells, puzzle } = state;
  const { size, blockRows, blockCols } = puzzle;
  
  const newCells = cells.map((cell, index) => {
    if (cell.given || cell.value !== 0) {
      return cell;
    }
    
    const candidates = new Set<number>();
    for (let num = 1; num <= size; num++) {
      candidates.add(num);
    }
    
    // Remove candidates based on peers
    const peers = getPeers(index, size, blockRows, blockCols);
    for (const peer of peers) {
      candidates.delete(cells[peer].value);
    }
    
    return {
      ...cell,
      pencilMarks: candidates,
    };
  });
  
  return {
    ...state,
    cells: newCells,
  };
}

/**
 * Clear all pencil marks
 */
export function clearAllPencilMarks(state: GameState): GameState {
  const newCells = state.cells.map(cell => ({
    ...cell,
    pencilMarks: new Set<number>(),
  }));
  
  return {
    ...state,
    cells: newCells,
  };
}

/**
 * Highlight cells with specific value or candidates
 */
export function highlightValue(state: GameState, value: number): GameState {
  const newCells = state.cells.map(cell => ({
    ...cell,
    isHighlighted: cell.value === value || cell.pencilMarks.has(value),
  }));
  
  return {
    ...state,
    cells: newCells,
  };
}

/**
 * Clear all highlights
 */
export function clearHighlights(state: GameState): GameState {
  const newCells = state.cells.map(cell => ({
    ...cell,
    isHighlighted: false,
  }));
  
  return {
    ...state,
    cells: newCells,
  };
}

/**
 * Select a cell
 */
export function selectCell(state: GameState, cellIndex: number | null): GameState {
  const newCells = state.cells.map((cell, index) => ({
    ...cell,
    isSelected: index === cellIndex,
  }));
  
  return {
    ...state,
    cells: newCells,
    selectedCell: cellIndex,
  };
}

/**
 * Get navigation target based on arrow key
 */
export function getNavigationTarget(
  currentIndex: number | null,
  direction: 'up' | 'down' | 'left' | 'right',
  size: number
): number {
  if (currentIndex === null) {
    return 0;
  }
  
  const row = Math.floor(currentIndex / size);
  const col = currentIndex % size;
  
  switch (direction) {
    case 'up':
      return ((row - 1 + size) % size) * size + col;
    case 'down':
      return ((row + 1) % size) * size + col;
    case 'left':
      return row * size + ((col - 1 + size) % size);
    case 'right':
      return row * size + ((col + 1) % size);
  }
}

/**
 * Reset game to initial state
 */
export function resetGame(state: GameState): GameState {
  return {
    ...state,
    cells: initializeCells(state.puzzle),
    history: [],
    historyIndex: -1,
    selectedCell: null,
    isPencilMode: false,
    isComplete: false,
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
  };
}

/**
 * Toggle pause state
 */
export function togglePause(state: GameState): GameState {
  if (state.isPaused) {
    return {
      ...state,
      isPaused: false,
      startTime: Date.now() - state.elapsedTime,
    };
  } else {
    return {
      ...state,
      isPaused: true,
      elapsedTime: Date.now() - state.startTime,
    };
  }
}

/**
 * Update elapsed time
 */
export function updateElapsedTime(state: GameState): GameState {
  if (state.isPaused || state.isComplete) {
    return state;
  }
  
  return {
    ...state,
    elapsedTime: Date.now() - state.startTime,
  };
}

/**
 * Get current puzzle values as array
 */
export function getCurrentValues(state: GameState): number[] {
  return state.cells.map(cell => cell.value);
}

/**
 * Get current pencil marks as array of sets
 */
export function getCurrentPencilMarks(state: GameState): Set<number>[] {
  return state.cells.map(cell => cell.pencilMarks);
}

/**
 * Smart pencil mode: auto-remove pencil marks from peers when placing a value
 */
export function setCellValueSmart(
  state: GameState,
  cellIndex: number,
  value: number
): GameState {
  const cell = state.cells[cellIndex];
  
  if (cell.given) {
    return state;
  }
  
  const { size, blockRows, blockCols } = state.puzzle;
  const peers = getPeers(cellIndex, size, blockRows, blockCols);
  
  // Create history entry for main cell
  const historyEntry: HistoryEntry = {
    cellIndex,
    previousValue: cell.value,
    previousPencilMarks: Array.from(cell.pencilMarks),
    newValue: value,
    newPencilMarks: [],
  };
  
  // Update cells: set value and remove pencil marks from peers
  const newCells = state.cells.map((c, i) => {
    if (i === cellIndex) {
      return {
        ...c,
        value,
        pencilMarks: new Set<number>(),
      };
    }
    
    // Remove value from peers' pencil marks
    if (peers.includes(i) && c.pencilMarks.has(value)) {
      const newMarks = new Set(c.pencilMarks);
      newMarks.delete(value);
      return {
        ...c,
        pencilMarks: newMarks,
      };
    }
    
    return c;
  });
  
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(historyEntry);
  
  const newState: GameState = {
    ...state,
    cells: newCells,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
  
  newState.cells = updateConflicts(newState);
  newState.isComplete = checkCompletion(newState);
  
  return newState;
}
