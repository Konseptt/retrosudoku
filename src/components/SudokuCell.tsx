/**
 * SudokuCell Component
 * Individual cell in the Sudoku grid
 */

import React, { memo } from 'react';
import { Cell } from '../types';

interface SudokuCellProps {
  cell: Cell;
  index: number;
  size: number;
  blockRows: number;
  blockCols: number;
  isSelected: boolean;
  showConflicts: boolean;
  showHighlights: boolean;
  onClick: () => void;
}

function SudokuCellComponent({
  cell,
  index,
  size,
  blockRows,
  blockCols,
  isSelected,
  showConflicts,
  showHighlights,
  onClick,
}: SudokuCellProps) {
  const row = Math.floor(index / size);
  const col = index % size;
  
  // Determine block borders
  const isBlockRight = (col + 1) % blockCols === 0 && col < size - 1;
  const isBlockBottom = (row + 1) % blockRows === 0 && row < size - 1;
  
  // Build class names
  const classNames = ['sudoku-cell'];
  if (cell.given) classNames.push('given');
  if (isSelected) classNames.push('selected');
  if (showConflicts && cell.isConflict) classNames.push('conflict');
  if (showHighlights && cell.isHighlighted) classNames.push('highlighted');
  if (isBlockRight) classNames.push('block-right');
  if (isBlockBottom) classNames.push('block-bottom');
  
  // Render pencil marks grid
  const renderPencilMarks = () => {
    if (cell.value !== 0 || cell.pencilMarks.size === 0) return null;
    
    const gridSize = size <= 9 ? 3 : 4;
    const marks: React.ReactNode[] = [];
    
    for (let i = 1; i <= size; i++) {
      marks.push(
        <span key={i} className="pencil-mark">
          {cell.pencilMarks.has(i) ? i : ''}
        </span>
      );
    }
    
    // Fill remaining cells for grid alignment
    while (marks.length < gridSize * gridSize) {
      marks.push(<span key={`empty-${marks.length}`} className="pencil-mark" />);
    }
    
    return <div className="pencil-marks">{marks}</div>;
  };
  
  // Render cell value
  const renderValue = () => {
    if (cell.value === 0) return null;
    
    const valueClassNames = ['cell-value'];
    if (cell.given) valueClassNames.push('given');
    else valueClassNames.push('entered');
    if (showConflicts && cell.isConflict) valueClassNames.push('conflict');
    
    // For sizes > 9, use hex or letters
    const displayValue = cell.value <= 9 
      ? cell.value.toString() 
      : cell.value.toString(16).toUpperCase();
    
    return <span className={valueClassNames.join(' ')}>{displayValue}</span>;
  };
  
  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Cell row ${row + 1} column ${col + 1}${
        cell.value ? `, value ${cell.value}` : ', empty'
      }${cell.given ? ', given' : ''}${cell.isConflict ? ', conflict' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {cell.value === 0 ? renderPencilMarks() : renderValue()}
    </div>
  );
}

export const SudokuCell = memo(SudokuCellComponent);
