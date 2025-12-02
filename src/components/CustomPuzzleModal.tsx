/**
 * CustomPuzzleModal Component
 * Allows users to create their own Sudoku puzzles
 */

import { useState, useCallback } from 'react';
import { SUPPORTED_SIZES, Puzzle } from '../types';
import { hasUniqueSolution, solvePuzzle } from '../solver';

interface CustomPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPuzzle: (puzzle: Puzzle) => void;
}

export function CustomPuzzleModal({ isOpen, onClose, onStartPuzzle }: CustomPuzzleModalProps) {
  const [selectedSize, setSelectedSize] = useState<number>(9);
  const [cells, setCells] = useState<number[]>(() => new Array(81).fill(0));
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const config = SUPPORTED_SIZES.find(c => c.size === selectedSize) || SUPPORTED_SIZES[2];

  const handleSizeChange = useCallback((newSize: number) => {
    setSelectedSize(newSize);
    setCells(new Array(newSize * newSize).fill(0));
    setSelectedCell(null);
    setError(null);
  }, []);

  const handleCellClick = useCallback((index: number) => {
    setSelectedCell(index);
  }, []);

  const handleNumberInput = useCallback((num: number) => {
    if (selectedCell === null) return;
    
    setCells(prev => {
      const newCells = [...prev];
      newCells[selectedCell] = num;
      return newCells;
    });
    setError(null);
  }, [selectedCell]);

  const handleClear = useCallback(() => {
    if (selectedCell === null) return;
    setCells(prev => {
      const newCells = [...prev];
      newCells[selectedCell] = 0;
      return newCells;
    });
  }, [selectedCell]);

  const handleClearAll = useCallback(() => {
    setCells(new Array(selectedSize * selectedSize).fill(0));
    setError(null);
  }, [selectedSize]);

  const checkConflicts = useCallback((puzzle: number[], size: number, blockRows: number, blockCols: number): boolean => {
    for (let i = 0; i < size * size; i++) {
      if (puzzle[i] === 0) continue;
      
      const row = Math.floor(i / size);
      const col = i % size;
      const value = puzzle[i];

      // Check row
      for (let c = 0; c < size; c++) {
        if (c !== col && puzzle[row * size + c] === value) return true;
      }

      // Check column
      for (let r = 0; r < size; r++) {
        if (r !== row && puzzle[r * size + col] === value) return true;
      }

      // Check box
      const boxStartRow = Math.floor(row / blockRows) * blockRows;
      const boxStartCol = Math.floor(col / blockCols) * blockCols;
      for (let r = boxStartRow; r < boxStartRow + blockRows; r++) {
        for (let c = boxStartCol; c < boxStartCol + blockCols; c++) {
          if ((r !== row || c !== col) && puzzle[r * size + c] === value) return true;
        }
      }
    }
    return false;
  }, []);

  const handleValidateAndStart = useCallback(async () => {
    setIsValidating(true);
    setError(null);

    // Check if puzzle has any clues
    const clueCount = cells.filter(c => c !== 0).length;
    if (clueCount < 17) {
      setError('A valid Sudoku needs at least 17 clues');
      setIsValidating(false);
      return;
    }

    // Check for conflicts
    if (checkConflicts(cells, selectedSize, config.blockRows, config.blockCols)) {
      setError('Puzzle has conflicting numbers');
      setIsValidating(false);
      return;
    }

    // Check for unique solution
    const isUnique = hasUniqueSolution(cells, selectedSize, config.blockRows, config.blockCols);
    if (!isUnique) {
      setError('Puzzle does not have a unique solution');
      setIsValidating(false);
      return;
    }

    // Get solution
    const result = solvePuzzle(cells, selectedSize, config.blockRows, config.blockCols);
    if (!result.solved) {
      setError('Puzzle has no solution');
      setIsValidating(false);
      return;
    }

    // Create puzzle object
    const puzzle: Puzzle = {
      cells: [...cells],
      solution: result.solution,
      size: selectedSize,
      blockRows: config.blockRows,
      blockCols: config.blockCols,
      difficulty: 'Custom',
      symmetry: 'none',
    };

    onStartPuzzle(puzzle);
    onClose();
    setIsValidating(false);
  }, [cells, selectedSize, config, checkConflicts, onStartPuzzle, onClose]);

  const handleImportString = useCallback(() => {
    const input = prompt('Enter puzzle string (81 digits for 9x9, use 0 or . for empty):');
    if (!input) return;

    const cleaned = input.replace(/[^0-9.]/g, '').replace(/\./g, '0');
    const expectedLength = selectedSize * selectedSize;

    if (cleaned.length !== expectedLength) {
      setError(`Expected ${expectedLength} digits, got ${cleaned.length}`);
      return;
    }

    const newCells = cleaned.split('').map(c => parseInt(c) || 0);
    
    // Validate numbers are in range
    const maxVal = selectedSize;
    if (newCells.some(v => v > maxVal)) {
      setError(`Numbers must be between 0 and ${maxVal}`);
      return;
    }

    setCells(newCells);
    setError(null);
  }, [selectedSize]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal custom-puzzle-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ Create Puzzle</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {/* Size Selection */}
          <div className="form-group">
            <label className="form-label">Grid Size</label>
            <select
              className="form-select"
              value={selectedSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
            >
              {SUPPORTED_SIZES.map(cfg => (
                <option key={cfg.size} value={cfg.size}>
                  {cfg.size}×{cfg.size}
                </option>
              ))}
            </select>
          </div>

          {/* Mini Grid */}
          <div className="custom-puzzle-grid-container">
            <div 
              className={`custom-puzzle-grid size-${selectedSize}`}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedSize}, 1fr)`,
                gap: '1px',
                background: 'var(--grid-lines)',
                border: '2px solid var(--cyan)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                maxWidth: selectedSize <= 9 ? '300px' : '400px',
                margin: '0 auto',
              }}
            >
              {cells.map((value, index) => {
                const row = Math.floor(index / selectedSize);
                const col = index % selectedSize;
                const isBlockRight = (col + 1) % config.blockCols === 0 && col < selectedSize - 1;
                const isBlockBottom = (row + 1) % config.blockRows === 0 && row < selectedSize - 1;

                return (
                  <div
                    key={index}
                    className={`custom-cell ${selectedCell === index ? 'selected' : ''}`}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selectedCell === index ? 'var(--cell-bg-selected)' : 'var(--cell-bg)',
                      cursor: 'pointer',
                      fontSize: selectedSize <= 9 ? '1.2rem' : '0.9rem',
                      fontFamily: 'VT323, monospace',
                      color: value ? 'var(--cyan)' : 'transparent',
                      borderRight: isBlockRight ? '2px solid var(--grid-thick)' : 'none',
                      borderBottom: isBlockBottom ? '2px solid var(--grid-thick)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onClick={() => handleCellClick(index)}
                  >
                    {value || '·'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Number Input */}
          <div className="custom-puzzle-numpad" style={{ marginTop: 'var(--spacing-md)' }}>
            <div 
              style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--spacing-xs)', 
                justifyContent: 'center' 
              }}
            >
              {Array.from({ length: selectedSize }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  className="btn btn-icon"
                  onClick={() => handleNumberInput(num)}
                  style={{ minWidth: '36px', minHeight: '36px' }}
                >
                  {num <= 9 ? num : num.toString(16).toUpperCase()}
                </button>
              ))}
              <button
                className="btn btn-icon btn-danger"
                onClick={handleClear}
                style={{ minWidth: '36px', minHeight: '36px' }}
                title="Clear cell"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-sm)', 
            justifyContent: 'center',
            marginTop: 'var(--spacing-md)',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-secondary" onClick={handleImportString}>
              📋 Import
            </button>
            <button className="btn btn-danger" onClick={handleClearAll}>
              🗑️ Clear All
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              background: 'rgba(255, 68, 68, 0.2)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--red)',
              textAlign: 'center',
              fontFamily: 'VT323, monospace',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Stats */}
          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            fontFamily: 'VT323, monospace',
            color: 'var(--text-muted)',
          }}>
            Clues: {cells.filter(c => c !== 0).length} / {selectedSize * selectedSize}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleValidateAndStart}
            disabled={isValidating}
          >
            {isValidating ? '⏳ Validating...' : '▶ Start Puzzle'}
          </button>
        </div>
      </div>
    </div>
  );
}
