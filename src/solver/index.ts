// Solver module exports
export { DLXSolver, solvePuzzle, hasUniqueSolution } from './dlx';
export { solveWithSteps, getHint, getPeers, initializeCandidates } from './humanSolver';
export {
  generatePuzzle,
  generatePuzzleWithDifficulty,
  getRandomConfig,
  getConfigForSize,
  encodePuzzle,
  decodePuzzle,
  exportPuzzleJson,
  importPuzzleJson,
} from './generator';
