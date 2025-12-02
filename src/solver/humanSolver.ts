/**
 * Human-style Sudoku Solver with Step-by-Step Explanations
 * Uses constraint propagation and logical techniques
 */

import { TechniqueType, SolveStep, SolverResult, HintResult } from '../types';

export interface CandidateGrid {
  size: number;
  blockRows: number;
  blockCols: number;
  values: number[];
  candidates: Set<number>[];
}

/**
 * Initialize candidate grid from puzzle
 */
export function initializeCandidates(
  puzzle: number[],
  size: number,
  blockRows: number,
  blockCols: number
): CandidateGrid {
  const candidates: Set<number>[] = [];
  const allCandidates = new Set(Array.from({ length: size }, (_, i) => i + 1));

  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] === 0) {
      candidates.push(new Set(allCandidates));
    } else {
      candidates.push(new Set());
    }
  }

  const grid: CandidateGrid = {
    size,
    blockRows,
    blockCols,
    values: [...puzzle],
    candidates,
  };

  // Remove initial constraints
  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] !== 0) {
      eliminateFromPeers(grid, i, puzzle[i]);
    }
  }

  return grid;
}

/**
 * Get row, column, and box for a cell index
 */
function getCellPosition(index: number, size: number): { row: number; col: number } {
  return {
    row: Math.floor(index / size),
    col: index % size,
  };
}

/**
 * Get box index for a given row/column
 */
export function getBox(row: number, col: number, blockRows: number, blockCols: number, size: number): number {
  return Math.floor(row / blockRows) * (size / blockCols) + Math.floor(col / blockCols);
}

/**
 * Get all peer indices for a cell (same row, column, or box)
 */
export function getPeers(index: number, size: number, blockRows: number, blockCols: number): number[] {
  const { row, col } = getCellPosition(index, size);
  const peers = new Set<number>();

  // Row peers
  for (let c = 0; c < size; c++) {
    const idx = row * size + c;
    if (idx !== index) peers.add(idx);
  }

  // Column peers
  for (let r = 0; r < size; r++) {
    const idx = r * size + col;
    if (idx !== index) peers.add(idx);
  }

  // Box peers
  const boxStartRow = Math.floor(row / blockRows) * blockRows;
  const boxStartCol = Math.floor(col / blockCols) * blockCols;
  for (let r = boxStartRow; r < boxStartRow + blockRows; r++) {
    for (let c = boxStartCol; c < boxStartCol + blockCols; c++) {
      const idx = r * size + c;
      if (idx !== index) peers.add(idx);
    }
  }

  return Array.from(peers);
}

/**
 * Eliminate a value from all peers of a cell
 */
function eliminateFromPeers(grid: CandidateGrid, index: number, value: number): void {
  const peers = getPeers(index, grid.size, grid.blockRows, grid.blockCols);
  for (const peer of peers) {
    grid.candidates[peer].delete(value);
  }
}

/**
 * Place a value in a cell and update candidates
 */
function placeValue(grid: CandidateGrid, index: number, value: number): void {
  grid.values[index] = value;
  grid.candidates[index].clear();
  eliminateFromPeers(grid, index, value);
}

/**
 * Get row indices
 */
function getRowIndices(row: number, size: number): number[] {
  return Array.from({ length: size }, (_, i) => row * size + i);
}

/**
 * Get column indices
 */
function getColIndices(col: number, size: number): number[] {
  return Array.from({ length: size }, (_, i) => i * size + col);
}

/**
 * Get box indices
 */
function getBoxIndices(boxIdx: number, size: number, blockRows: number, blockCols: number): number[] {
  const boxesPerRow = size / blockCols;
  const boxRow = Math.floor(boxIdx / boxesPerRow);
  const boxCol = boxIdx % boxesPerRow;
  const startRow = boxRow * blockRows;
  const startCol = boxCol * blockCols;
  
  const indices: number[] = [];
  for (let r = startRow; r < startRow + blockRows; r++) {
    for (let c = startCol; c < startCol + blockCols; c++) {
      indices.push(r * size + c);
    }
  }
  return indices;
}

/**
 * Get cell name for explanations
 */
function getCellName(index: number, size: number): string {
  const { row, col } = getCellPosition(index, size);
  return `R${row + 1}C${col + 1}`;
}

/**
 * Find naked single: cell with only one candidate
 */
function findNakedSingle(grid: CandidateGrid): SolveStep | null {
  for (let i = 0; i < grid.values.length; i++) {
    if (grid.values[i] === 0 && grid.candidates[i].size === 1) {
      const value = Array.from(grid.candidates[i])[0];
      return {
        step: 0,
        type: 'Single Candidate',
        cells: [i],
        values: [value],
        explanation: `Cell ${getCellName(i, grid.size)} has only one candidate: ${value}`,
      };
    }
  }
  return null;
}

/**
 * Find hidden single: value that can only go in one cell in a unit
 */
function findHiddenSingle(grid: CandidateGrid): SolveStep | null {
  const { size, blockRows, blockCols } = grid;
  const numBoxes = (size / blockRows) * (size / blockCols);

  // Check rows
  for (let row = 0; row < size; row++) {
    const indices = getRowIndices(row, size);
    const step = findHiddenSingleInUnit(grid, indices, `row ${row + 1}`);
    if (step) return step;
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    const indices = getColIndices(col, size);
    const step = findHiddenSingleInUnit(grid, indices, `column ${col + 1}`);
    if (step) return step;
  }

  // Check boxes
  for (let box = 0; box < numBoxes; box++) {
    const indices = getBoxIndices(box, size, blockRows, blockCols);
    const step = findHiddenSingleInUnit(grid, indices, `box ${box + 1}`);
    if (step) return step;
  }

  return null;
}

function findHiddenSingleInUnit(grid: CandidateGrid, indices: number[], unitName: string): SolveStep | null {
  for (let num = 1; num <= grid.size; num++) {
    const possibleCells = indices.filter(
      i => grid.values[i] === 0 && grid.candidates[i].has(num)
    );
    
    if (possibleCells.length === 1) {
      const cellIdx = possibleCells[0];
      return {
        step: 0,
        type: 'Hidden Single',
        cells: [cellIdx],
        values: [num],
        explanation: `${num} can only go in ${getCellName(cellIdx, grid.size)} in ${unitName}`,
      };
    }
  }
  return null;
}

/**
 * Find naked pair: two cells in a unit with same two candidates
 */
function findNakedPair(grid: CandidateGrid): SolveStep | null {
  const { size, blockRows, blockCols } = grid;
  const numBoxes = (size / blockRows) * (size / blockCols);

  const checkUnit = (indices: number[], unitName: string): SolveStep | null => {
    const cellsWithTwoCandidates = indices.filter(
      i => grid.values[i] === 0 && grid.candidates[i].size === 2
    );

    for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
      for (let j = i + 1; j < cellsWithTwoCandidates.length; j++) {
        const cell1 = cellsWithTwoCandidates[i];
        const cell2 = cellsWithTwoCandidates[j];
        const cands1 = Array.from(grid.candidates[cell1]);
        const cands2 = Array.from(grid.candidates[cell2]);

        if (cands1.length === 2 && cands1[0] === cands2[0] && cands1[1] === cands2[1]) {
          // Found a pair, check if it eliminates anything
          const eliminations: { cell: number; values: number[] }[] = [];
          
          for (const idx of indices) {
            if (idx !== cell1 && idx !== cell2 && grid.values[idx] === 0) {
              const elims = cands1.filter(v => grid.candidates[idx].has(v));
              if (elims.length > 0) {
                eliminations.push({ cell: idx, values: elims });
              }
            }
          }

          if (eliminations.length > 0) {
            return {
              step: 0,
              type: 'Naked Pair',
              cells: [cell1, cell2],
              values: cands1,
              eliminatedCandidates: eliminations,
              explanation: `Cells ${getCellName(cell1, grid.size)} and ${getCellName(cell2, grid.size)} form a naked pair {${cands1.join(', ')}} in ${unitName}, eliminating these values from other cells`,
            };
          }
        }
      }
    }
    return null;
  };

  // Check all units
  for (let row = 0; row < size; row++) {
    const step = checkUnit(getRowIndices(row, size), `row ${row + 1}`);
    if (step) return step;
  }
  
  for (let col = 0; col < size; col++) {
    const step = checkUnit(getColIndices(col, size), `column ${col + 1}`);
    if (step) return step;
  }
  
  for (let box = 0; box < numBoxes; box++) {
    const step = checkUnit(getBoxIndices(box, size, blockRows, blockCols), `box ${box + 1}`);
    if (step) return step;
  }

  return null;
}

/**
 * Find hidden pair: two values that only appear in two cells in a unit
 */
function findHiddenPair(grid: CandidateGrid): SolveStep | null {
  const { size, blockRows, blockCols } = grid;
  const numBoxes = (size / blockRows) * (size / blockCols);

  const checkUnit = (indices: number[], unitName: string): SolveStep | null => {
    // Find which cells each value can go in
    const valueCells: Map<number, number[]> = new Map();
    for (let num = 1; num <= size; num++) {
      const cells = indices.filter(
        i => grid.values[i] === 0 && grid.candidates[i].has(num)
      );
      if (cells.length === 2) {
        valueCells.set(num, cells);
      }
    }

    // Find pairs of values that share the same two cells
    const values = Array.from(valueCells.keys());
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const cells1 = valueCells.get(values[i])!;
        const cells2 = valueCells.get(values[j])!;
        
        if (cells1[0] === cells2[0] && cells1[1] === cells2[1]) {
          const pairCells = cells1;
          const pairValues = [values[i], values[j]];
          
          // Check if there are other candidates to eliminate
          const eliminations: { cell: number; values: number[] }[] = [];
          for (const cell of pairCells) {
            const otherCands = Array.from(grid.candidates[cell]).filter(
              v => !pairValues.includes(v)
            );
            if (otherCands.length > 0) {
              eliminations.push({ cell, values: otherCands });
            }
          }

          if (eliminations.length > 0) {
            return {
              step: 0,
              type: 'Hidden Pair',
              cells: pairCells,
              values: pairValues,
              eliminatedCandidates: eliminations,
              explanation: `Values {${pairValues.join(', ')}} can only go in ${getCellName(pairCells[0], size)} and ${getCellName(pairCells[1], size)} in ${unitName}, so other candidates in these cells can be eliminated`,
            };
          }
        }
      }
    }
    return null;
  };

  for (let row = 0; row < size; row++) {
    const step = checkUnit(getRowIndices(row, size), `row ${row + 1}`);
    if (step) return step;
  }
  
  for (let col = 0; col < size; col++) {
    const step = checkUnit(getColIndices(col, size), `column ${col + 1}`);
    if (step) return step;
  }
  
  for (let box = 0; box < numBoxes; box++) {
    const step = checkUnit(getBoxIndices(box, size, blockRows, blockCols), `box ${box + 1}`);
    if (step) return step;
  }

  return null;
}

/**
 * Find X-Wing pattern
 */
function findXWing(grid: CandidateGrid): SolveStep | null {
  const { size } = grid;

  for (let num = 1; num <= size; num++) {
    // Check rows for X-Wing
    const rowsWith2Cells: { row: number; cols: number[] }[] = [];
    
    for (let row = 0; row < size; row++) {
      const cols = [];
      for (let col = 0; col < size; col++) {
        const idx = row * size + col;
        if (grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
          cols.push(col);
        }
      }
      if (cols.length === 2) {
        rowsWith2Cells.push({ row, cols });
      }
    }

    // Find two rows with same column positions
    for (let i = 0; i < rowsWith2Cells.length; i++) {
      for (let j = i + 1; j < rowsWith2Cells.length; j++) {
        const r1 = rowsWith2Cells[i];
        const r2 = rowsWith2Cells[j];
        
        if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
          // Found X-Wing, check for eliminations in columns
          const eliminations: { cell: number; values: number[] }[] = [];
          
          for (const col of r1.cols) {
            for (let row = 0; row < size; row++) {
              if (row !== r1.row && row !== r2.row) {
                const idx = row * size + col;
                if (grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
                  eliminations.push({ cell: idx, values: [num] });
                }
              }
            }
          }

          if (eliminations.length > 0) {
            const cells = [
              r1.row * size + r1.cols[0],
              r1.row * size + r1.cols[1],
              r2.row * size + r2.cols[0],
              r2.row * size + r2.cols[1],
            ];
            
            return {
              step: 0,
              type: 'X-Wing',
              cells,
              values: [num],
              eliminatedCandidates: eliminations,
              explanation: `X-Wing on ${num} in rows ${r1.row + 1} and ${r2.row + 1}, columns ${r1.cols[0] + 1} and ${r1.cols[1] + 1}. Eliminating ${num} from other cells in these columns.`,
            };
          }
        }
      }
    }

    // Check columns for X-Wing (similar logic, swapped)
    const colsWith2Cells: { col: number; rows: number[] }[] = [];
    
    for (let col = 0; col < size; col++) {
      const rows = [];
      for (let row = 0; row < size; row++) {
        const idx = row * size + col;
        if (grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
          rows.push(row);
        }
      }
      if (rows.length === 2) {
        colsWith2Cells.push({ col, rows });
      }
    }

    for (let i = 0; i < colsWith2Cells.length; i++) {
      for (let j = i + 1; j < colsWith2Cells.length; j++) {
        const c1 = colsWith2Cells[i];
        const c2 = colsWith2Cells[j];
        
        if (c1.rows[0] === c2.rows[0] && c1.rows[1] === c2.rows[1]) {
          const eliminations: { cell: number; values: number[] }[] = [];
          
          for (const row of c1.rows) {
            for (let col = 0; col < size; col++) {
              if (col !== c1.col && col !== c2.col) {
                const idx = row * size + col;
                if (grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
                  eliminations.push({ cell: idx, values: [num] });
                }
              }
            }
          }

          if (eliminations.length > 0) {
            const cells = [
              c1.rows[0] * size + c1.col,
              c1.rows[1] * size + c1.col,
              c1.rows[0] * size + c2.col,
              c1.rows[1] * size + c2.col,
            ];
            
            return {
              step: 0,
              type: 'X-Wing',
              cells,
              values: [num],
              eliminatedCandidates: eliminations,
              explanation: `X-Wing on ${num} in columns ${c1.col + 1} and ${c2.col + 1}, rows ${c1.rows[0] + 1} and ${c1.rows[1] + 1}. Eliminating ${num} from other cells in these rows.`,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Find pointing pair: candidates in a box that are confined to one row/column
 */
function findPointingPair(grid: CandidateGrid): SolveStep | null {
  const { size, blockRows, blockCols } = grid;
  const numBoxes = (size / blockRows) * (size / blockCols);

  for (let box = 0; box < numBoxes; box++) {
    const boxIndices = getBoxIndices(box, size, blockRows, blockCols);
    
    for (let num = 1; num <= size; num++) {
      const cellsWithNum = boxIndices.filter(
        i => grid.values[i] === 0 && grid.candidates[i].has(num)
      );
      
      if (cellsWithNum.length < 2 || cellsWithNum.length > blockRows) continue;

      // Check if all in same row
      const rows = cellsWithNum.map(i => Math.floor(i / size));
      if (new Set(rows).size === 1) {
        const row = rows[0];
        const eliminations: { cell: number; values: number[] }[] = [];
        
        for (let col = 0; col < size; col++) {
          const idx = row * size + col;
          if (!boxIndices.includes(idx) && grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
            eliminations.push({ cell: idx, values: [num] });
          }
        }

        if (eliminations.length > 0) {
          return {
            step: 0,
            type: 'Pointing Pair',
            cells: cellsWithNum,
            values: [num],
            eliminatedCandidates: eliminations,
            explanation: `In box ${box + 1}, ${num} is confined to row ${row + 1}. Eliminating ${num} from other cells in this row.`,
          };
        }
      }

      // Check if all in same column
      const cols = cellsWithNum.map(i => i % size);
      if (new Set(cols).size === 1) {
        const col = cols[0];
        const eliminations: { cell: number; values: number[] }[] = [];
        
        for (let row = 0; row < size; row++) {
          const idx = row * size + col;
          if (!boxIndices.includes(idx) && grid.values[idx] === 0 && grid.candidates[idx].has(num)) {
            eliminations.push({ cell: idx, values: [num] });
          }
        }

        if (eliminations.length > 0) {
          return {
            step: 0,
            type: 'Pointing Pair',
            cells: cellsWithNum,
            values: [num],
            eliminatedCandidates: eliminations,
            explanation: `In box ${box + 1}, ${num} is confined to column ${col + 1}. Eliminating ${num} from other cells in this column.`,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Apply a solve step to the grid
 */
function applyStep(grid: CandidateGrid, step: SolveStep): void {
  if (step.type === 'Single Candidate' || step.type === 'Hidden Single') {
    placeValue(grid, step.cells[0], step.values[0]);
  } else if (step.eliminatedCandidates) {
    for (const elim of step.eliminatedCandidates) {
      for (const val of elim.values) {
        grid.candidates[elim.cell].delete(val);
      }
    }
  }
}

/**
 * Check if puzzle is solved
 */
function isSolved(grid: CandidateGrid): boolean {
  return grid.values.every(v => v !== 0);
}

/**
 * Human-style solver that produces step-by-step explanations
 */
export function solveWithSteps(
  puzzle: number[],
  size: number = 9,
  blockRows: number = 3,
  blockCols: number = 3
): SolverResult {
  const startTime = performance.now();
  const grid = initializeCandidates(puzzle, size, blockRows, blockCols);
  const steps: SolveStep[] = [];
  let stepNum = 0;

  const techniques: Array<() => SolveStep | null> = [
    () => findNakedSingle(grid),
    () => findHiddenSingle(grid),
    () => findNakedPair(grid),
    () => findHiddenPair(grid),
    () => findPointingPair(grid),
    () => findXWing(grid),
  ];

  while (!isSolved(grid)) {
    let found = false;
    
    for (const technique of techniques) {
      const step = technique();
      if (step) {
        step.step = ++stepNum;
        steps.push(step);
        applyStep(grid, step);
        found = true;
        break;
      }
    }

    if (!found) {
      // No technique found, puzzle requires guessing
      break;
    }
  }

  const timeMs = performance.now() - startTime;

  return {
    solved: isSolved(grid),
    solution: grid.values,
    timeMs,
    techniques: steps,
  };
}

/**
 * Get a single hint for the current puzzle state
 */
export function getHint(
  puzzle: number[],
  pencilMarks: Set<number>[],
  size: number = 9,
  blockRows: number = 3,
  blockCols: number = 3,
  hintType?: TechniqueType
): HintResult | null {
  const grid = initializeCandidates(puzzle, size, blockRows, blockCols);
  
  // Use provided pencil marks if available
  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] === 0 && pencilMarks[i] && pencilMarks[i].size > 0) {
      grid.candidates[i] = new Set(pencilMarks[i]);
    }
  }

  const techniques: Array<{ type: TechniqueType; find: () => SolveStep | null }> = [
    { type: 'Single Candidate', find: () => findNakedSingle(grid) },
    { type: 'Hidden Single', find: () => findHiddenSingle(grid) },
    { type: 'Naked Pair', find: () => findNakedPair(grid) },
    { type: 'Hidden Pair', find: () => findHiddenPair(grid) },
    { type: 'Pointing Pair', find: () => findPointingPair(grid) },
    { type: 'X-Wing', find: () => findXWing(grid) },
  ];

  if (hintType) {
    const technique = techniques.find(t => t.type === hintType);
    if (technique) {
      const step = technique.find();
      if (step) {
        return {
          type: step.type,
          cells: step.cells,
          values: step.values,
          explanation: step.explanation,
          action: step.eliminatedCandidates ? 'eliminate' : 'place',
        };
      }
    }
    return null;
  }

  for (const technique of techniques) {
    const step = technique.find();
    if (step) {
      return {
        type: step.type,
        cells: step.cells,
        values: step.values,
        explanation: step.explanation,
        action: step.eliminatedCandidates ? 'eliminate' : 'place',
      };
    }
  }

  return null;
}

/**
 * Validate if a move is correct according to solution
 */
export function validateMove(
  _puzzle: number[],
  solution: number[],
  cellIndex: number,
  value: number
): boolean {
  return solution[cellIndex] === value;
}
