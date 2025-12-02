/**
 * GameControls Component
 * Action buttons for game operations
 */



interface GameControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePencil: () => void;
  onHint: () => void;
  onAutoSolve: () => void;
  onStepSolve: () => void;
  onReset: () => void;
  onNewGame: () => void;
  onSave: () => void;
  onFillPencilMarks: () => void;
  onClearPencilMarks: () => void;
}

export function GameControls({
  canUndo,
  canRedo,
  isPencilMode,
  onUndo,
  onRedo,
  onTogglePencil,
  onHint,
  onAutoSolve,
  onStepSolve,
  onReset,
  onNewGame,
  onSave,
  onFillPencilMarks,
  onClearPencilMarks,
}: GameControlsProps) {
  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <span className="control-panel-title">Controls</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {/* Primary Actions */}
        <div className="btn-group">
          <button
            className="btn btn-icon"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo (Ctrl+Z)"
            title="Undo (Ctrl+Z)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a5 5 0 0 1 5 5v2" />
              <polyline points="3,10 7,6" />
              <polyline points="3,10 7,14" />
            </svg>
          </button>
          
          <button
            className="btn btn-icon"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo (Ctrl+Y)"
            title="Redo (Ctrl+Y)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H11a5 5 0 0 0-5 5v2" />
              <polyline points="21,10 17,6" />
              <polyline points="21,10 17,14" />
            </svg>
          </button>
          
          <button
            className={`btn ${isPencilMode ? 'btn-secondary' : ''}`}
            onClick={onTogglePencil}
            aria-label={`${isPencilMode ? 'Disable' : 'Enable'} pencil mode (P)`}
            title="Toggle Pencil Mode (P)"
            style={isPencilMode ? { borderColor: 'var(--yellow)', boxShadow: '0 0 5px var(--yellow)' } : {}}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            Pencil
          </button>
        </div>
        
        {/* Pencil Mark Actions */}
        <div className="btn-group">
          <button
            className="btn"
            onClick={onFillPencilMarks}
            aria-label="Fill all pencil marks"
            title="Auto-fill pencil marks"
          >
            Fill Notes
          </button>
          
          <button
            className="btn"
            onClick={onClearPencilMarks}
            aria-label="Clear all pencil marks"
            title="Clear all pencil marks"
          >
            Clear Notes
          </button>
        </div>
        
        {/* Hint Actions */}
        <div className="btn-group">
          <button
            className="btn btn-secondary"
            onClick={onHint}
            aria-label="Get hint (H)"
            title="Get Hint (H)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Hint
          </button>
        </div>
        
        {/* Solver Actions */}
        <div className="btn-group">
          <button
            className="btn"
            onClick={onAutoSolve}
            aria-label="Auto solve puzzle"
            title="Solve instantly"
          >
            Auto Solve
          </button>
          
          <button
            className="btn"
            onClick={onStepSolve}
            aria-label="Step-by-step solve"
            title="Watch solution steps"
          >
            Step Solve
          </button>
        </div>
        
        {/* Game Actions */}
        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={onNewGame}
            aria-label="Start new game (N)"
            title="New Game (N)"
          >
            New Game
          </button>
          
          <button
            className="btn"
            onClick={onSave}
            aria-label="Save game (Ctrl+S)"
            title="Save Game (Ctrl+S)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17,21 17,13 7,13 7,21" />
              <polyline points="7,3 7,8 15,8" />
            </svg>
            Save
          </button>
          
          <button
            className="btn btn-danger"
            onClick={onReset}
            aria-label="Reset puzzle"
            title="Reset to start"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
