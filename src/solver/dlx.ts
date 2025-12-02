/**
 * Dancing Links (DLX) Solver for Sudoku
 * Ultra-fast exact cover solver using Knuth's Algorithm X
 * Performance target: solve 9x9 puzzles in under 50ms
 */

interface DLXNode {
  left: DLXNode;
  right: DLXNode;
  up: DLXNode;
  down: DLXNode;
  column: ColumnNode;
  row: number;
}

interface ColumnNode extends DLXNode {
  size: number;
  id: number;
  name: string;
}

export class DLXSolver {
  private header: ColumnNode;
  private columns: ColumnNode[];
  private solution: number[][] = [];
  private solutionCount = 0;
  private maxSolutions = 2; // For uniqueness checking
  private startTime = 0;
  
  private size: number;
  private blockRows: number;
  private blockCols: number;
  
  constructor(size: number, blockRows: number, blockCols: number) {
    this.size = size;
    this.blockRows = blockRows;
    this.blockCols = blockCols;
    this.columns = [];
    this.header = this.createHeader();
  }
  
  private createNode(): DLXNode {
    const node = {} as DLXNode;
    node.left = node;
    node.right = node;
    node.up = node;
    node.down = node;
    return node;
  }
  
  private createColumnNode(id: number, name: string): ColumnNode {
    const node = this.createNode() as ColumnNode;
    node.size = 0;
    node.id = id;
    node.name = name;
    node.column = node;
    return node;
  }
  
  private createHeader(): ColumnNode {
    const n = this.size;
    const numConstraints = 4 * n * n;
    
    const header = this.createColumnNode(-1, 'header');
    this.columns = [header];
    
    let prev = header;
    for (let i = 0; i < numConstraints; i++) {
      const col = this.createColumnNode(i, this.getConstraintName(i));
      col.left = prev;
      prev.right = col;
      col.right = header;
      header.left = col;
      this.columns.push(col);
      prev = col;
    }
    
    return header;
  }
  
  private getConstraintName(id: number): string {
    const n = this.size;
    const nn = n * n;
    if (id < nn) return `cell(${Math.floor(id / n)},${id % n})`;
    if (id < 2 * nn) return `row(${Math.floor((id - nn) / n)},${(id - nn) % n + 1})`;
    if (id < 3 * nn) return `col(${Math.floor((id - 2 * nn) / n)},${(id - 2 * nn) % n + 1})`;
    return `box(${Math.floor((id - 3 * nn) / n)},${(id - 3 * nn) % n + 1})`;
  }
  
  private getBox(row: number, col: number): number {
    return Math.floor(row / this.blockRows) * (this.size / this.blockCols) + Math.floor(col / this.blockCols);
  }
  
  private getConstraints(row: number, col: number, num: number): number[] {
    const n = this.size;
    const cellIdx = row * n + col;
    const box = this.getBox(row, col);
    
    return [
      cellIdx,                    // Cell constraint
      n * n + row * n + num - 1,  // Row constraint
      2 * n * n + col * n + num - 1, // Column constraint
      3 * n * n + box * n + num - 1  // Box constraint
    ];
  }
  
  public buildMatrix(puzzle: number[]): void {
    const n = this.size;
    
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const cellIdx = row * n + col;
        const given = puzzle[cellIdx];
        
        const numStart = given > 0 ? given : 1;
        const numEnd = given > 0 ? given : n;
        
        for (let num = numStart; num <= numEnd; num++) {
          const constraints = this.getConstraints(row, col, num);
          const rowId = cellIdx * n + num - 1;
          this.addRow(rowId, constraints);
        }
      }
    }
  }
  
  private addRow(rowId: number, constraintIds: number[]): void {
    let first: DLXNode | null = null;
    let prev: DLXNode | null = null;
    
    for (const colId of constraintIds) {
      const col = this.columns[colId + 1];
      const node = this.createNode();
      node.row = rowId;
      node.column = col;
      
      // Link vertically
      node.up = col.up;
      node.down = col;
      col.up.down = node;
      col.up = node;
      col.size++;
      
      // Link horizontally
      if (!first) {
        first = node;
        node.left = node;
        node.right = node;
      } else {
        node.left = prev!;
        node.right = first;
        prev!.right = node;
        first.left = node;
      }
      prev = node;
    }
  }
  
  private cover(col: ColumnNode): void {
    col.right.left = col.left;
    col.left.right = col.right;
    
    let row = col.down;
    while (row !== col) {
      let node = row.right;
      while (node !== row) {
        node.down.up = node.up;
        node.up.down = node.down;
        node.column.size--;
        node = node.right;
      }
      row = row.down;
    }
  }
  
  private uncover(col: ColumnNode): void {
    let row = col.up;
    while (row !== col) {
      let node = row.left;
      while (node !== row) {
        node.column.size++;
        node.down.up = node;
        node.up.down = node;
        node = node.left;
      }
      row = row.up;
    }
    
    col.right.left = col;
    col.left.right = col;
  }
  
  private search(depth: number, partialSolution: number[]): boolean {
    if (this.header.right === this.header) {
      this.solution.push([...partialSolution]);
      this.solutionCount++;
      return this.solutionCount >= this.maxSolutions;
    }
    
    // Choose column with minimum size (MRV heuristic)
    let minCol = this.header.right as ColumnNode;
    let node = minCol.right as ColumnNode;
    while (node !== this.header) {
      if (node.size < minCol.size) minCol = node;
      node = node.right as ColumnNode;
    }
    
    if (minCol.size === 0) return false;
    
    this.cover(minCol);
    
    let row = minCol.down;
    while (row !== minCol) {
      partialSolution.push(row.row);
      
      let node = row.right;
      while (node !== row) {
        this.cover(node.column);
        node = node.right;
      }
      
      if (this.search(depth + 1, partialSolution)) {
        return true;
      }
      
      partialSolution.pop();
      
      node = row.left;
      while (node !== row) {
        this.uncover(node.column);
        node = node.left;
      }
      
      row = row.down;
    }
    
    this.uncover(minCol);
    return false;
  }
  
  public solve(puzzle: number[], findAll = false): { solved: boolean; solution: number[]; solutionCount: number; timeMs: number } {
    this.startTime = performance.now();
    this.solution = [];
    this.solutionCount = 0;
    this.maxSolutions = findAll ? 1000 : 2;
    
    // Rebuild for fresh solve
    this.header = this.createHeader();
    this.buildMatrix(puzzle);
    
    this.search(0, []);
    
    const timeMs = performance.now() - this.startTime;
    
    if (this.solution.length === 0) {
      return { solved: false, solution: [], solutionCount: 0, timeMs };
    }
    
    // Convert solution rows to grid
    const n = this.size;
    const result = [...puzzle];
    for (const rowId of this.solution[0]) {
      const cellIdx = Math.floor(rowId / n);
      const num = (rowId % n) + 1;
      result[cellIdx] = num;
    }
    
    return { solved: true, solution: result, solutionCount: this.solutionCount, timeMs };
  }
  
  public hasUniqueSolution(puzzle: number[]): boolean {
    const result = this.solve(puzzle);
    return result.solved && result.solutionCount === 1;
  }
}

/**
 * Fast solver wrapper for quick access
 */
export function solvePuzzle(
  puzzle: number[],
  size: number = 9,
  blockRows: number = 3,
  blockCols: number = 3
): { solved: boolean; solution: number[]; timeMs: number } {
  const solver = new DLXSolver(size, blockRows, blockCols);
  const result = solver.solve(puzzle);
  return { solved: result.solved, solution: result.solution, timeMs: result.timeMs };
}

export function hasUniqueSolution(
  puzzle: number[],
  size: number = 9,
  blockRows: number = 3,
  blockCols: number = 3
): boolean {
  const solver = new DLXSolver(size, blockRows, blockCols);
  return solver.hasUniqueSolution(puzzle);
}
