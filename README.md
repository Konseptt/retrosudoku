# RetroSudoku

A lovingly handcrafted Sudoku web application with authentic 1980s/90s retro computing aesthetics. Features a lightning-fast DLX solver, human-style hint system, and flexible puzzle generation.

![RetroSudoku](https://img.shields.io/badge/RetroSudoku-v1.0.0-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)

## Features

### Gameplay
- **Flexible Grid Sizes**: 4x4, 6x6, 9x9, 12x12, and 16x16 puzzles
- **Multiple Difficulty Levels**: Easy, Medium, Hard, Expert, and Evil
- **Pencil Marks**: Toggle candidate notes for cells
- **Auto-Validation**: Optional highlighting of conflicts
- **Undo/Redo**: Full history with 100-step limit
- **Timer**: Track your solve time with pause support
- **Save/Load**: Persist games to IndexedDB

### Solver & Hints
- **Human-Style Hints**: Explains solving techniques step-by-step
- **Techniques Supported**:
  - Single Candidate (Naked Single)
  - Hidden Single
  - Naked Pair
  - Hidden Pair  
  - Pointing Pair
  - Box/Line Reduction
  - X-Wing
- **Auto-Solve**: Watch the puzzle solve with animated steps
- **Performance**: Solves 9x9 puzzles in under 50ms using DLX algorithm

### Retro Aesthetics
- **CRT Monitor Effect**: Authentic scanlines and screen glow
- **Pixel Fonts**: Press Start 2P, VT323, Space Mono
- **Pastel 80s Palette**: Cyan, magenta, and peach colors
- **Chiptune Sounds**: 8-bit audio feedback using Web Audio API
- **Vintage Animations**: Satisfying interactions throughout

### PWA Support
- **Offline Mode**: Full functionality without internet
- **Installable**: Add to home screen on mobile
- **Responsive**: Works on all screen sizes

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Konseptt/retrosudoku.git
cd retrosudoku

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests in watch mode
npm run test:watch
```

## Architecture

### Project Structure

```
retrosudoku/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── favicon.svg        # Retro grid icon
├── src/
│   ├── components/        # React UI components
│   │   ├── SudokuCell.tsx
│   │   ├── SudokuGrid.tsx
│   │   ├── NumberPad.tsx
│   │   ├── Timer.tsx
│   │   ├── GameControls.tsx
│   │   ├── Header.tsx
│   │   ├── Toast.tsx
│   │   └── *Modal.tsx     # Various modals
│   ├── game/
│   │   └── gameState.ts   # Game logic & history
│   ├── solver/
│   │   ├── dlx.ts         # Dancing Links solver
│   │   ├── humanSolver.ts # Human-style solver
│   │   └── generator.ts   # Puzzle generator
│   ├── storage/
│   │   └── storage.ts     # IndexedDB persistence
│   ├── styles/
│   │   └── index.css      # Retro CSS theme
│   ├── utils/
│   │   ├── export.ts      # PNG export & sharing
│   │   └── sound.ts       # Chiptune audio
│   ├── types.ts           # TypeScript definitions
│   ├── App.tsx            # Main application
│   └── main.tsx           # Entry point
└── tests/
    └── solver.test.ts     # Unit tests
```

### Core Modules

#### DLX Solver (`src/solver/dlx.ts`)

Ultra-fast exact cover solver using Knuth's Dancing Links algorithm:

```typescript
import { solvePuzzle, hasUniqueSolution } from './solver';

// Solve a puzzle
const puzzle = [0, 0, 3, 0, 2, 0, 6, 0, 0, /* ... */];
const result = solvePuzzle(puzzle, 9, 3, 3);
// { solved: true, solution: [...], timeMs: 12.5 }

// Check uniqueness
const isUnique = hasUniqueSolution(puzzle, 9, 3, 3);
```

#### Human Solver (`src/solver/humanSolver.ts`)

Provides human-readable solving steps:

```typescript
import { HumanSolver } from './solver';

const solver = new HumanSolver(9, 3, 3);
const result = solver.solveWithSteps(puzzle);
// {
//   solved: true,
//   steps: [
//     { technique: 'Hidden Single', description: 'Row 3 has only...', cells: [...], values: [7] },
//     ...
//   ]
// }

// Get a single hint
const hint = solver.getHint(puzzle, pencilMarks);
```

#### Puzzle Generator (`src/solver/generator.ts`)

Generates puzzles with configurable parameters:

```typescript
import { PuzzleGenerator } from './solver';

const generator = new PuzzleGenerator({
  size: 9,
  blockRows: 3,
  blockCols: 3,
  difficulty: 'hard',
  symmetry: 'rotational'
});

const puzzle = generator.generate();
// { puzzle: [...], solution: [...], difficulty: 'hard', clueCount: 28 }
```

#### Game State (`src/game/gameState.ts`)

Manages game state with full undo/redo:

```typescript
import { createGameFromPuzzle, setCellValue, undo, redo } from './game';

let game = createGameFromPuzzle(puzzleConfig);
game = setCellValue(game, 0, 0, 5);
game = undo(game);
game = redo(game);
```

#### Storage (`src/storage/storage.ts`)

IndexedDB persistence:

```typescript
import { 
  saveGame, 
  getAllSavedGames, 
  updateStats, 
  getSettings 
} from './storage';

await saveGame(game);
const games = await getAllSavedGames();
await updateStats(9, 'hard', 245);
const settings = await getSettings();
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Enter number |
| `0` / `Delete` / `Backspace` | Clear cell |
| `Arrow keys` | Navigate grid |
| `P` | Toggle pencil mode |
| `H` | Get hint |
| `Z` / `Ctrl+Z` | Undo |
| `Y` / `Ctrl+Y` | Redo |
| `N` | New game |
| `S` | Save game |
| `?` | Show help |
| `Escape` | Close modal / Deselect |

## Theming

The app supports multiple themes via CSS custom properties:

```css
:root {
  /* Default Retro Theme */
  --bg-primary: #1a0a2e;
  --text-primary: #00ffff;
  --accent-primary: #ff00ff;
  --accent-secondary: #ffaa88;
}

[data-theme="light"] {
  --bg-primary: #f5f0e8;
  --text-primary: #2d1b4e;
  /* ... */
}

[data-theme="high-contrast"] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  /* ... */
}
```

## Performance

| Operation | Target | Actual |
|-----------|--------|--------|
| 9x9 Solve | <50ms | ~12ms |
| 9x9 Generate | <500ms | ~200ms |
| Hint Calculation | <100ms | ~25ms |
| Initial Load | <2s | ~800ms |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Tests cover:
- DLX solver correctness
- Unique solution detection
- Human solver techniques
- Puzzle generator output
- Game state mutations

## API Reference

### Types

```typescript
interface Puzzle {
  puzzle: number[];        // 0 = empty
  solution: number[];
  size: number;
  blockRows: number;
  blockCols: number;
  difficulty: Difficulty;
  clueCount: number;
}

interface GameState {
  puzzle: Puzzle;
  cells: CellState[][];
  selectedCell: { row: number; col: number } | null;
  isComplete: boolean;
  isPaused: boolean;
  time: number;
  history: HistoryEntry[];
  historyIndex: number;
}

interface SolveStep {
  technique: string;
  description: string;
  cells: { row: number; col: number }[];
  values: number[];
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'evil';
type Symmetry = 'none' | 'rotational' | 'horizontal' | 'vertical' | 'diagonal';
```

### Events

The app dispatches custom events for integration:

```typescript
// Puzzle completed
window.addEventListener('retrosudoku:complete', (e) => {
  console.log('Completed in', e.detail.time, 'seconds');
});

// Game saved
window.addEventListener('retrosudoku:save', (e) => {
  console.log('Game saved:', e.detail.id);
});
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Code Style

- TypeScript strict mode
- Functional components with hooks
- CSS modules for scoped styles
- Comprehensive JSDoc comments

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Donald Knuth](https://www-cs-faculty.stanford.edu/~knuth/) for the Dancing Links algorithm
- [Google Fonts](https://fonts.google.com/) for Press Start 2P and VT323
- The retro computing community for inspiration

---

<p align="center">
  Made with code and coffee
  <br>
  <sub>Insert coin to continue...</sub>
</p>
