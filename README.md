# RetroSudoku

A modern Sudoku web application with multiple themes including authentic retro computing aesthetics. Features a lightning-fast DLX solver, human-style hint system, and flexible puzzle generation.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://konseptt.github.io/retrosudoku/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Live Demo

**[Play RetroSudoku Now](https://konseptt.github.io/retrosudoku/)**

## Features

### Gameplay
- **Flexible Grid Sizes** - 4x4, 6x6, 9x9, 12x12, and 16x16 puzzles
- **Multiple Difficulty Levels** - Easy, Medium, Hard, Expert, and Evil
- **Custom Puzzles** - Create and solve your own puzzles
- **Pencil Marks** - Toggle candidate notes for cells
- **Auto-Validation** - Optional highlighting of conflicts
- **Undo/Redo** - Full history support
- **Timer** - Track your solve time with pause support
- **Save/Load** - Persist games locally

### Solver & Hints
- **Human-Style Hints** - Step-by-step solving technique explanations
- **Auto-Solve Animation** - Watch the puzzle solve with visual steps
- **Techniques**: Naked Single, Hidden Single, Naked Pair, Hidden Pair, Pointing Pair, Box/Line Reduction, X-Wing
- **Performance** - Solves 9x9 puzzles in ~12ms using DLX algorithm

### Themes
- **Clean Modern** (default) - Minimal, professional design
- **Retro CRT** - Authentic 80s/90s computing aesthetic with scanlines and glow
- **Arcade** - Vibrant gaming colors
- **Terminal** - Monochrome hacker style
- **Cassette** - Warm vintage tones

### Progressive Web App
- **Offline Mode** - Works without internet
- **Installable** - Add to home screen
- **Responsive** - Desktop, tablet, and mobile

## Quick Start

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
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| IndexedDB | Local Storage |
| Web Audio API | Sound Effects |
| CSS Custom Properties | Theming |

## Project Structure

```
src/
├── components/     # React UI components
├── solver/         # DLX & human solver algorithms
├── game/           # Game state management
├── storage/        # IndexedDB persistence
├── styles/         # CSS themes
└── utils/          # Helpers (audio, export)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Enter number |
| `Backspace` | Clear cell |
| `Arrow keys` | Navigate |
| `P` | Pencil mode |
| `H` | Get hint |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Donald Knuth](https://www-cs-faculty.stanford.edu/~knuth/) for the Dancing Links algorithm
- [Google Fonts](https://fonts.google.com/) for Press Start 2P and VT323

---

<p align="center">
  <strong><a href="https://konseptt.github.io/retrosudoku/">Play Now</a></strong>
</p>
