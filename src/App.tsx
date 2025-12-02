/**
 * RetroSudoku - Main Application Component
 * Wires together all features with full keyboard support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Puzzle, PuzzleConfig, Difficulty, Symmetry, HintResult, SolveStep, SavedGame } from './types';
import {
  createGameState,
  setCellValue,
  setCellValueSmart,
  togglePencilMark,
  clearCell,
  undo,
  redo,
  selectCell,
  getNavigationTarget,
  togglePause,
  resetGame,
  fillAllPencilMarks,
  clearAllPencilMarks,
  highlightValue,
  clearHighlights,
  getCurrentValues,
  getCurrentPencilMarks,
  autoSolve,
} from './game';
import {
  generatePuzzle,
  solveWithSteps,
  getHint,
  solvePuzzle,
  encodePuzzle,
} from './solver';
import {
  Header,
  SudokuGrid,
  NumberPad,
  Timer,
  GameControls,
  NewGameModal,
  CustomPuzzleModal,
  VictoryModal,
  HintDisplay,
  SolverSteps,
  SavedGamesModal,
  SettingsModal,
  StatsModal,
  HelpModal,
  ToastContainer,
  useToast,
} from './components';
import {
  saveGame,
  getSettings,
  recordGameCompletion,
  AppSettings,
  initDB,
} from './storage';

// Default puzzle config
const DEFAULT_CONFIG: PuzzleConfig = { size: 9, blockRows: 3, blockCols: 3 };

export function App() {
  // Core game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showNewGame, setShowNewGame] = useState(false);
  const [showCustomPuzzle, setShowCustomPuzzle] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showSavedGames, setShowSavedGames] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Hint and solver state
  const [currentHint, setCurrentHint] = useState<HintResult | null>(null);
  const [solverSteps, setSolverSteps] = useState<SolveStep[]>([]);
  const [currentSolverStep, setCurrentSolverStep] = useState(0);
  const [isSolverPlaying, setIsSolverPlaying] = useState(false);
  const [showSolver, setShowSolver] = useState(false);
  
  // Victory state
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [solverTimeMs, setSolverTimeMs] = useState<number | undefined>();
  
  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();
  
  // Refs for timer and solver animation
  const solverIntervalRef = useRef<number | null>(null);
  
  // Initialize app
  useEffect(() => {
    async function init() {
      await initDB();
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
      
      // Generate initial puzzle
      const puzzle = generatePuzzle(DEFAULT_CONFIG, 'Medium', 'rotational');
      setGameState(createGameState(puzzle));
      setIsLoading(false);
    }
    
    init();
  }, []);
  
  // Apply theme from settings
  useEffect(() => {
    if (!settings) return;
    
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-high-contrast', String(settings.highContrast));
    document.documentElement.style.setProperty(
      '--scanline-opacity',
      settings.scanlines ? '0.05' : '0'
    );
  }, [settings]);
  
  // Solver animation
  useEffect(() => {
    if (!isSolverPlaying || solverSteps.length === 0) return;
    
    solverIntervalRef.current = window.setInterval(() => {
      setCurrentSolverStep(prev => {
        if (prev >= solverSteps.length - 1) {
          setIsSolverPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    
    return () => {
      if (solverIntervalRef.current) {
        clearInterval(solverIntervalRef.current);
      }
    };
  }, [isSolverPlaying, solverSteps.length]);
  
  // Apply solver step to grid visualization
  useEffect(() => {
    if (!gameState || solverSteps.length === 0 || !showSolver) return;
    
    const step = solverSteps[currentSolverStep];
    if (step) {
      // Highlight cells involved in this step
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cells: prev.cells.map((cell, index) => ({
            ...cell,
            isHighlighted: step.cells.includes(index),
          })),
        };
      });
    }
  }, [currentSolverStep, solverSteps, showSolver]);
  
  // Keyboard event handler
  useEffect(() => {
    if (!gameState || showNewGame || showCustomPuzzle || showVictory || showSavedGames || showSettings || showStats || showHelp) {
      return;
    }
    
    const currentGameState = gameState; // Capture for closure
    
    function handleKeyDown(e: KeyboardEvent) {
      // Prevent default for game keys
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'];
      if (gameKeys.includes(e.key) || (e.key >= '1' && e.key <= '9')) {
        e.preventDefault();
      }
      
      // Navigation
      if (e.key.startsWith('Arrow')) {
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        const newCell = getNavigationTarget(currentGameState.selectedCell, direction, currentGameState.puzzle.size);
        setGameState(selectCell(currentGameState, newCell));
        return;
      }
      
      // Number input
      if (e.key >= '1' && e.key <= '9' && currentGameState.selectedCell !== null) {
        const num = parseInt(e.key);
        if (num <= currentGameState.puzzle.size) {
          if (currentGameState.isPencilMode) {
            setGameState(togglePencilMark(currentGameState, currentGameState.selectedCell, num));
          } else {
            const setter = settings?.autoRemovePencilMarks ? setCellValueSmart : setCellValue;
            setGameState(setter(currentGameState, currentGameState.selectedCell, num));
          }
        }
        return;
      }
      
      // For larger grids, allow A-G for 10-16
      if (currentGameState.puzzle.size > 9 && /^[a-g]$/i.test(e.key) && currentGameState.selectedCell !== null) {
        const num = e.key.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        if (num <= currentGameState.puzzle.size) {
          if (currentGameState.isPencilMode) {
            setGameState(togglePencilMark(currentGameState, currentGameState.selectedCell, num));
          } else {
            const setter = settings?.autoRemovePencilMarks ? setCellValueSmart : setCellValue;
            setGameState(setter(currentGameState, currentGameState.selectedCell, num));
          }
        }
        return;
      }
      
      // Clear cell
      if ((e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') && currentGameState.selectedCell !== null) {
        setGameState(clearCell(currentGameState, currentGameState.selectedCell));
        return;
      }
      
      // Escape - deselect
      if (e.key === 'Escape') {
        setGameState(selectCell(currentGameState, null));
        setCurrentHint(null);
        return;
      }
      
      // Toggle pencil mode
      if (e.key.toLowerCase() === 'p') {
        setGameState(prev => prev ? { ...prev, isPencilMode: !prev.isPencilMode } : prev);
        return;
      }
      
      // Undo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setGameState(undo(currentGameState));
        return;
      }
      
      // Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        setGameState(redo(currentGameState));
        return;
      }
      
      // Save
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveGame();
        return;
      }
      
      // Hint
      if (e.key.toLowerCase() === 'h' && settings?.showHints) {
        handleGetHint();
        return;
      }
      
      // New game
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey) {
        setShowNewGame(true);
        return;
      }
      
      // Pause/Resume
      if (e.key === ' ') {
        e.preventDefault();
        setGameState(togglePause(currentGameState));
        return;
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, showNewGame, showCustomPuzzle, showVictory, showSavedGames, showSettings, showStats, showHelp, settings]);
  
  // Check for victory
  useEffect(() => {
    if (gameState?.isComplete && !showVictory) {
      handleVictory();
    }
  }, [gameState?.isComplete]);
  
  // Game action handlers
  const handleCellClick = useCallback((index: number) => {
    if (!gameState) return;
    setGameState(selectCell(gameState, index));
    setCurrentHint(null);
    
    // Highlight same numbers if enabled
    if (settings?.highlightSameNumbers && gameState.cells[index].value !== 0) {
      setGameState(prev => prev ? highlightValue(prev, gameState.cells[index].value) : prev);
    } else {
      setGameState(prev => prev ? clearHighlights(prev) : prev);
    }
  }, [gameState, settings]);
  
  const handleNumberClick = useCallback((num: number) => {
    if (!gameState || gameState.selectedCell === null) return;
    
    if (gameState.isPencilMode) {
      setGameState(togglePencilMark(gameState, gameState.selectedCell, num));
    } else {
      const setter = settings?.autoRemovePencilMarks ? setCellValueSmart : setCellValue;
      setGameState(setter(gameState, gameState.selectedCell, num));
    }
  }, [gameState, settings]);
  
  const handleClear = useCallback(() => {
    if (!gameState || gameState.selectedCell === null) return;
    setGameState(clearCell(gameState, gameState.selectedCell));
  }, [gameState]);
  
  const handleUndo = useCallback(() => {
    if (!gameState) return;
    setGameState(undo(gameState));
  }, [gameState]);
  
  const handleRedo = useCallback(() => {
    if (!gameState) return;
    setGameState(redo(gameState));
  }, [gameState]);
  
  const handleTogglePencil = useCallback(() => {
    setGameState(prev => prev ? { ...prev, isPencilMode: !prev.isPencilMode } : prev);
  }, []);
  
  const handlePause = useCallback(() => {
    if (!gameState) return;
    setGameState(togglePause(gameState));
  }, [gameState]);
  
  const handleReset = useCallback(() => {
    if (!gameState) return;
    if (confirm('Reset puzzle? All progress will be lost.')) {
      setGameState(resetGame(gameState));
      setCurrentHint(null);
      setSolverSteps([]);
      setShowSolver(false);
      addToast('Puzzle reset', 'info');
    }
  }, [gameState, addToast]);
  
  const handleNewGame = useCallback(() => {
    setShowNewGame(true);
  }, []);
  
  const handleStartGame = useCallback((config: PuzzleConfig, difficulty: Difficulty, symmetry: Symmetry) => {
    const puzzle = generatePuzzle(config, difficulty, symmetry);
    setGameState(createGameState(puzzle));
    setCurrentHint(null);
    setSolverSteps([]);
    setShowSolver(false);
    setShowVictory(false);
    addToast(`New ${difficulty} ${config.size}×${config.size} puzzle`, 'success');
  }, [addToast]);

  const handleStartCustomPuzzle = useCallback((puzzle: Puzzle) => {
    setGameState(createGameState(puzzle));
    setCurrentHint(null);
    setSolverSteps([]);
    setShowSolver(false);
    setShowVictory(false);
    addToast(`Custom ${puzzle.size}×${puzzle.size} puzzle loaded!`, 'success');
  }, [addToast]);

  const handleOpenCustomPuzzle = useCallback(() => {
    setShowCustomPuzzle(true);
  }, []);
  
  const handleSaveGame = useCallback(async () => {
    if (!gameState) return;
    
    try {
      await saveGame(
        gameState.puzzle,
        gameState.cells,
        Date.now() - gameState.startTime
      );
      addToast('Game saved!', 'success');
    } catch (err) {
      addToast('Failed to save game', 'error');
    }
  }, [gameState, addToast]);
  
  const handleLoadGame = useCallback((savedGame: SavedGame) => {
    const newState = createGameState(savedGame.puzzle);
    newState.cells = savedGame.cells.map(cell => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
    }));
    newState.elapsedTime = savedGame.elapsedTime;
    newState.startTime = Date.now() - savedGame.elapsedTime;
    setGameState(newState);
    setCurrentHint(null);
    setSolverSteps([]);
    setShowSolver(false);
    addToast('Game loaded', 'success');
  }, [addToast]);
  
  const handleGetHint = useCallback(() => {
    if (!gameState) return;
    
    const hint = getHint(
      getCurrentValues(gameState),
      getCurrentPencilMarks(gameState),
      gameState.puzzle.size,
      gameState.puzzle.blockRows,
      gameState.puzzle.blockCols
    );
    
    if (hint) {
      setCurrentHint(hint);
      
      // Highlight hint cells
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cells: prev.cells.map((cell, index) => ({
            ...cell,
            isHighlighted: hint.cells.includes(index),
          })),
        };
      });
    } else {
      addToast('No hints available', 'info');
    }
  }, [gameState, addToast]);
  
  const handleApplyHint = useCallback(() => {
    if (!gameState || !currentHint) return;
    
    if (currentHint.action === 'place' && currentHint.cells.length === 1) {
      const setter = settings?.autoRemovePencilMarks ? setCellValueSmart : setCellValue;
      setGameState(setter(gameState, currentHint.cells[0], currentHint.values[0]));
    }
    
    setCurrentHint(null);
    setGameState(prev => prev ? clearHighlights(prev) : prev);
  }, [gameState, currentHint, settings]);
  
  const handleDismissHint = useCallback(() => {
    setCurrentHint(null);
    setGameState(prev => prev ? clearHighlights(prev) : prev);
  }, []);
  
  const handleAutoSolve = useCallback(() => {
    if (!gameState) return;
    
    const result = autoSolve(gameState);
    setGameState(result.state);
    setSolverTimeMs(result.timeMs);
    addToast(`Solved in ${result.timeMs.toFixed(1)}ms`, 'success');
  }, [gameState, addToast]);
  
  const handleStepSolve = useCallback(() => {
    if (!gameState) return;
    
    const result = solveWithSteps(
      gameState.puzzle.cells,
      gameState.puzzle.size,
      gameState.puzzle.blockRows,
      gameState.puzzle.blockCols
    );
    
    if (result.techniques.length > 0) {
      setSolverSteps(result.techniques);
      setCurrentSolverStep(0);
      setShowSolver(true);
      setSolverTimeMs(result.timeMs);
    } else {
      addToast('Could not generate solving steps', 'warning');
    }
  }, [gameState, addToast]);
  
  const handleSolverStepChange = useCallback((step: number) => {
    setCurrentSolverStep(step);
  }, []);
  
  const handleSolverPlayPause = useCallback(() => {
    setIsSolverPlaying(prev => !prev);
  }, []);
  
  const handleCloseSolver = useCallback(() => {
    setShowSolver(false);
    setSolverSteps([]);
    setIsSolverPlaying(false);
    setGameState(prev => prev ? clearHighlights(prev) : prev);
  }, []);
  
  const handleFillPencilMarks = useCallback(() => {
    if (!gameState) return;
    setGameState(fillAllPencilMarks(gameState));
    addToast('Pencil marks filled', 'info');
  }, [gameState, addToast]);
  
  const handleClearPencilMarks = useCallback(() => {
    if (!gameState) return;
    setGameState(clearAllPencilMarks(gameState));
    addToast('Pencil marks cleared', 'info');
  }, [gameState, addToast]);
  
  const handleVictory = useCallback(async () => {
    if (!gameState) return;
    
    const time = Date.now() - gameState.startTime;
    const result = await recordGameCompletion(
      gameState.puzzle.size,
      gameState.puzzle.difficulty,
      time,
      true
    );
    
    setIsNewRecord(result.newBestTime);
    
    // Get solver time for comparison
    const solveResult = solvePuzzle(
      gameState.puzzle.cells,
      gameState.puzzle.size,
      gameState.puzzle.blockRows,
      gameState.puzzle.blockCols
    );
    setSolverTimeMs(solveResult.timeMs);
    
    setShowVictory(true);
    
    if (result.achievement) {
      addToast(`🏆 Achievement: ${result.achievement}`, 'success');
    }
  }, [gameState, addToast]);
  
  const handleShare = useCallback(async () => {
    if (!gameState) return;
    
    const encoded = encodePuzzle(gameState.puzzle);
    const url = `${window.location.origin}${window.location.pathname}?puzzle=${encoded}`;
    
    try {
      await navigator.clipboard.writeText(url);
      addToast('Link copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy link', 'error');
    }
  }, [gameState, addToast]);
  
  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);
  
  // Loading state
  if (isLoading || !gameState || !settings) {
    return (
      <div className="loading-screen crt-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Loading RetroSudoku...</div>
      </div>
    );
  }
  
  return (
    <div className={`app-container ${settings.crtGlow ? 'crt-screen' : ''}`}>
      <Header
        onNewGame={handleNewGame}
        onLoadGame={() => setShowSavedGames(true)}
        onSettings={() => setShowSettings(true)}
        onStats={() => setShowStats(true)}
        onHelp={() => setShowHelp(true)}
      />
      
      <main className="main-content">
        <div className="game-area">
          {settings.showTimer && (
            <Timer
              startTime={gameState.startTime}
              elapsedTime={gameState.elapsedTime}
              isPaused={gameState.isPaused}
              isComplete={gameState.isComplete}
              onPause={handlePause}
            />
          )}
          
          <SudokuGrid
            cells={gameState.cells}
            size={gameState.puzzle.size}
            blockRows={gameState.puzzle.blockRows}
            blockCols={gameState.puzzle.blockCols}
            selectedCell={gameState.selectedCell}
            isPencilMode={gameState.isPencilMode}
            showConflicts={settings.highlightConflicts}
            showHighlights={true}
            onCellClick={handleCellClick}
          />
          
          <div style={{ 
            fontSize: 'var(--font-sm)', 
            color: 'var(--text-muted)', 
            textAlign: 'center' 
          }}>
            {gameState.puzzle.size}×{gameState.puzzle.size} • {gameState.puzzle.difficulty} • {gameState.puzzle.symmetry}
          </div>
          
          {currentHint && (
            <HintDisplay
              hint={currentHint}
              onApply={handleApplyHint}
              onDismiss={handleDismissHint}
            />
          )}
        </div>
        
        <div className="controls-area">
          <NumberPad
            size={gameState.puzzle.size}
            isPencilMode={gameState.isPencilMode}
            onNumberClick={handleNumberClick}
            onClear={handleClear}
          />
          
          <GameControls
            canUndo={gameState.historyIndex >= 0}
            canRedo={gameState.historyIndex < gameState.history.length - 1}
            isPencilMode={gameState.isPencilMode}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onTogglePencil={handleTogglePencil}
            onHint={handleGetHint}
            onAutoSolve={handleAutoSolve}
            onStepSolve={handleStepSolve}
            onReset={handleReset}
            onNewGame={handleNewGame}
            onSave={handleSaveGame}
            onFillPencilMarks={handleFillPencilMarks}
            onClearPencilMarks={handleClearPencilMarks}
          />
          
          {showSolver && solverSteps.length > 0 && (
            <SolverSteps
              steps={solverSteps}
              currentStep={currentSolverStep}
              isPlaying={isSolverPlaying}
              speed={500}
              onStepChange={handleSolverStepChange}
              onPlayPause={handleSolverPlayPause}
              onClose={handleCloseSolver}
            />
          )}
        </div>
      </main>
      
      {/* Modals */}
      <NewGameModal
        isOpen={showNewGame}
        onClose={() => setShowNewGame(false)}
        onStartGame={handleStartGame}
        onCreateCustom={handleOpenCustomPuzzle}
      />

      <CustomPuzzleModal
        isOpen={showCustomPuzzle}
        onClose={() => setShowCustomPuzzle(false)}
        onStartPuzzle={handleStartCustomPuzzle}
      />
      
      <VictoryModal
        isOpen={showVictory}
        time={Date.now() - gameState.startTime}
        difficulty={gameState.puzzle.difficulty}
        size={gameState.puzzle.size}
        isNewRecord={isNewRecord}
        solverTimeMs={solverTimeMs}
        onClose={() => setShowVictory(false)}
        onNewGame={() => {
          setShowVictory(false);
          setShowNewGame(true);
        }}
        onShare={handleShare}
      />
      
      <SavedGamesModal
        isOpen={showSavedGames}
        onClose={() => setShowSavedGames(false)}
        onLoad={handleLoadGame}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
      
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
      
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
