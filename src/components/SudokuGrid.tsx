/**
 * SudokuGrid Component
 * Main puzzle grid display
 */

import { useCallback } from 'react';
import { Cell } from '../types';
import { SudokuCell } from './SudokuCell';

interface SudokuGridProps {
  cells: Cell[];
  size: number;
  blockRows: number;
  blockCols: number;
  selectedCell: number | null;
  isPencilMode?: boolean; // Optional, not passed to cells
  showConflicts: boolean;
  showHighlights: boolean;
  onCellClick: (index: number) => void;
}

export function SudokuGrid({
  cells,
  size,
  blockRows,
  blockCols,
  selectedCell,
  showConflicts,
  showHighlights,
  onCellClick,
}: SudokuGridProps) {
  const handleCellClick = useCallback(
    (index: number) => () => {
      onCellClick(index);
    },
    [onCellClick]
  );
  
  return (
    <div 
      className={`sudoku-grid size-${size} crt-glow`}
      role="grid"
      aria-label={`${size} by ${size} Sudoku puzzle`}
    >
      {cells.map((cell, index) => (
        <SudokuCell
          key={index}
          cell={cell}
          index={index}
          size={size}
          blockRows={blockRows}
          blockCols={blockCols}
          isSelected={selectedCell === index}
          showConflicts={showConflicts}
          showHighlights={showHighlights}
          onClick={handleCellClick(index)}
        />
      ))}
    </div>
  );
}
