# Contributing to RetroSudoku

Thank you for your interest in contributing to RetroSudoku! This document provides guidelines and steps for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Konseptt/retrosudoku/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with clear, descriptive messages:
   ```bash
   git commit -m "Add: description of feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request against `main`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/retrosudoku.git
cd retrosudoku

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Coding Standards

### TypeScript
- Use TypeScript strict mode
- Define explicit types for function parameters and returns
- Avoid `any` type when possible

### React
- Use functional components with hooks
- Keep components focused and reusable
- Use meaningful component and prop names

### CSS
- Use CSS custom properties for theming
- Follow BEM-like naming conventions
- Ensure responsive design

### Commits
- Use clear, descriptive commit messages
- Reference issues when applicable: `Fix #123: description`

## Project Structure

```
src/
├── components/     # React UI components
├── solver/         # Sudoku solving algorithms
├── game/           # Game state management
├── storage/        # Data persistence
├── styles/         # CSS and theming
├── utils/          # Helper functions
└── types.ts        # TypeScript definitions
```

## Testing

- Write tests for new features
- Ensure existing tests pass before submitting PR
- Run `npm test` to execute the test suite

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for helping make RetroSudoku better!
