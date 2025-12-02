/**
 * Header Component
 * App header with logo and navigation
 */



interface HeaderProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onStats: () => void;
  onHelp: () => void;
}

export function Header({ onNewGame, onLoadGame, onSettings, onStats, onHelp }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">
        <svg className="logo-icon" viewBox="0 0 48 48" fill="currentColor">
          <rect x="2" y="2" width="44" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="2" x2="16" y2="46" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="2" x2="32" y2="46" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="16" x2="46" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="32" x2="46" y2="32" stroke="currentColor" strokeWidth="2" />
          <text x="24" y="28" textAnchor="middle" fontSize="12" fontFamily="monospace">9</text>
        </svg>
        <div>
          <h1 style={{ fontSize: 'var(--font-lg)', marginBottom: '2px' }}>RetroSudoku</h1>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            Solve like it's 1986
          </div>
        </div>
      </div>
      
      <nav className="btn-group">
        <button className="btn btn-icon" onClick={onNewGame} aria-label="New game" title="New Game">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        
        <button className="btn btn-icon" onClick={onLoadGame} aria-label="Load game" title="Load Game">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        
        <button className="btn btn-icon" onClick={onStats} aria-label="Statistics" title="Stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        
        <button className="btn btn-icon" onClick={onSettings} aria-label="Settings" title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        
        <button className="btn btn-icon" onClick={onHelp} aria-label="Help" title="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
