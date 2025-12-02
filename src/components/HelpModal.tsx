/**
 * HelpModal Component
 * Keyboard shortcuts and how to play
 */

import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;
  
  const shortcuts = [
    { keys: ['1-9'], description: 'Enter number' },
    { keys: ['0', 'Delete', 'Backspace'], description: 'Clear cell' },
    { keys: ['Arrow keys'], description: 'Navigate cells' },
    { keys: ['P'], description: 'Toggle pencil mode' },
    { keys: ['H'], description: 'Get hint' },
    { keys: ['N'], description: 'New game' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo' },
    { keys: ['Ctrl', 'S'], description: 'Save game' },
    { keys: ['Space'], description: 'Pause/Resume' },
    { keys: ['Esc'], description: 'Deselect cell' },
  ];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">How to Play</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {/* Rules */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Rules</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Fill every row, column, and box with the numbers 1-9 (or 1-N for larger grids).
              Each number can only appear once in each row, column, and box.
            </p>
          </div>
          
          {/* Tips */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Tips</h3>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 'var(--spacing-lg)' }}>
              <li>Use <strong style={{ color: 'var(--yellow)' }}>Pencil Mode</strong> to note possible candidates</li>
              <li>Look for cells with only one possible number (naked singles)</li>
              <li>Look for numbers that can only go in one place (hidden singles)</li>
              <li>Use the <strong style={{ color: 'var(--magenta)' }}>Hint</strong> button when stuck</li>
              <li>Conflicts are highlighted in <strong style={{ color: 'var(--red)' }}>red</strong></li>
            </ul>
          </div>
          
          {/* Keyboard Shortcuts */}
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <div className="shortcut-keys">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <kbd className="kbd">{key}</kbd>
                        {i < shortcut.keys.length - 1 && <span style={{ color: 'var(--text-muted)' }}>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="shortcut-description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Techniques */}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Solving Techniques</h3>
            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
              {[
                { name: 'Single Candidate', desc: 'Cell has only one possible number' },
                { name: 'Hidden Single', desc: 'Number can only go in one cell in a unit' },
                { name: 'Naked Pair', desc: 'Two cells with same two candidates' },
                { name: 'Hidden Pair', desc: 'Two numbers only in two cells' },
                { name: 'X-Wing', desc: 'Advanced row/column elimination' },
              ].map((tech, i) => (
                <div 
                  key={i}
                  style={{
                    padding: 'var(--spacing-sm)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ color: 'var(--cyan)', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>
                    {tech.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                    {tech.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
}
