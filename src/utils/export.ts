/**
 * Export Utilities for RetroSudoku
 * PNG export and sharing functionality
 */

import { Cell, Puzzle } from '../types';

/**
 * Export puzzle grid to PNG
 */
export async function exportToPng(
  cells: Cell[],
  puzzle: Puzzle,
  filename: string = 'retrosudoku-puzzle.png'
): Promise<void> {
  const { size, blockRows, blockCols } = puzzle;
  const cellSize = 50;
  const padding = 20;
  const gridSize = size * cellSize;
  const canvasSize = gridSize + padding * 2;
  
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Grid background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(padding, padding, gridSize, gridSize);
  
  // Draw cells
  for (let i = 0; i < cells.length; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const x = padding + col * cellSize;
    const y = padding + row * cellSize;
    
    // Cell background for givens
    if (cells[i].given) {
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(x, y, cellSize, cellSize);
    }
    
    // Cell value
    if (cells[i].value !== 0) {
      ctx.fillStyle = cells[i].given ? '#000000' : '#2196f3';
      ctx.font = `bold ${cellSize * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const displayValue = cells[i].value <= 9 
        ? cells[i].value.toString() 
        : cells[i].value.toString(16).toUpperCase();
      
      ctx.fillText(displayValue, x + cellSize / 2, y + cellSize / 2);
    } else if (cells[i].pencilMarks.size > 0) {
      // Draw pencil marks
      ctx.fillStyle = '#999999';
      ctx.font = `${cellSize * 0.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const gridDim = size <= 9 ? 3 : 4;
      const markSize = cellSize / gridDim;
      
      cells[i].pencilMarks.forEach(mark => {
        const markRow = Math.floor((mark - 1) / gridDim);
        const markCol = (mark - 1) % gridDim;
        const markX = x + markCol * markSize + markSize / 2;
        const markY = y + markRow * markSize + markSize / 2;
        ctx.fillText(mark.toString(), markX, markY);
      });
    }
  }
  
  // Draw grid lines
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= size; i++) {
    const pos = padding + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, padding);
    ctx.lineTo(pos, padding + gridSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, pos);
    ctx.lineTo(padding + gridSize, pos);
    ctx.stroke();
  }
  
  // Draw block dividers
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  
  for (let i = 0; i <= size / blockCols; i++) {
    const pos = padding + i * blockCols * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, padding);
    ctx.lineTo(pos, padding + gridSize);
    ctx.stroke();
  }
  
  for (let i = 0; i <= size / blockRows; i++) {
    const pos = padding + i * blockRows * cellSize;
    ctx.beginPath();
    ctx.moveTo(padding, pos);
    ctx.lineTo(padding + gridSize, pos);
    ctx.stroke();
  }
  
  // Border
  ctx.strokeRect(padding, padding, gridSize, gridSize);
  
  // Download
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Print puzzle
 */
export function printPuzzle(): void {
  window.print();
}

/**
 * Copy puzzle to clipboard as text
 */
export async function copyPuzzleAsText(cells: Cell[], size: number): Promise<void> {
  let text = '';
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = cells[row * size + col].value;
      text += value === 0 ? '.' : (value <= 9 ? value : String.fromCharCode('A'.charCodeAt(0) + value - 10));
      if (col < size - 1) text += ' ';
    }
    text += '\n';
  }
  
  await navigator.clipboard.writeText(text);
}

/**
 * Share puzzle via Web Share API
 */
export async function sharePuzzle(
  puzzle: Puzzle,
  encodedUrl: string
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title: 'RetroSudoku Puzzle',
      text: `Can you solve this ${puzzle.size}×${puzzle.size} ${puzzle.difficulty} Sudoku?`,
      url: encodedUrl,
    });
    return true;
  } catch {
    return false;
  }
}
