/**
 * NewGameModal Component
 * Dialog for configuring and starting a new game
 */

import { useState } from 'react';
import { Difficulty, Symmetry, PuzzleConfig, SUPPORTED_SIZES } from '../types';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: PuzzleConfig, difficulty: Difficulty, symmetry: Symmetry) => void;
  onCreateCustom: () => void;
}

export function NewGameModal({ isOpen, onClose, onStartGame, onCreateCustom }: NewGameModalProps) {
  const [selectedSize, setSelectedSize] = useState<number>(9);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [symmetry, setSymmetry] = useState<Symmetry>('rotational');
  const [randomSize, setRandomSize] = useState(false);
  
  if (!isOpen) return null;
  
  const handleStart = () => {
    let config: PuzzleConfig;
    
    if (randomSize) {
      config = SUPPORTED_SIZES[Math.floor(Math.random() * SUPPORTED_SIZES.length)];
    } else {
      config = SUPPORTED_SIZES.find(c => c.size === selectedSize) || SUPPORTED_SIZES[2];
    }
    
    onStartGame(config, difficulty, symmetry);
    onClose();
  };

  const handleCreateCustom = () => {
    onClose();
    onCreateCustom();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🎮 New Game</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {/* Game Mode Tabs */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <div style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              border: '2px solid var(--cyan)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              cursor: 'default',
            }}>
              <div style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--spacing-xs)' }}>🎲</div>
              <div style={{ 
                fontFamily: 'Press Start 2P, monospace', 
                fontSize: 'var(--font-xs)',
                color: 'var(--cyan)'
              }}>
                Random
              </div>
            </div>
            <div 
              style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--grid-lines)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={handleCreateCustom}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--magenta)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--grid-lines)';
              }}
            >
              <div style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--spacing-xs)' }}>✏️</div>
              <div style={{ 
                fontFamily: 'Press Start 2P, monospace', 
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)'
              }}>
                Custom
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="form-group">
            <label className="form-label">Grid Size</label>
            <div className="form-checkbox" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="randomSize"
                checked={randomSize}
                onChange={(e) => setRandomSize(e.target.checked)}
              />
              <label htmlFor="randomSize">Random Size</label>
            </div>
            {!randomSize && (
              <select
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(Number(e.target.value))}
              >
                {SUPPORTED_SIZES.map(config => (
                  <option key={config.size} value={config.size}>
                    {config.size}×{config.size} ({config.blockRows}×{config.blockCols} blocks)
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Difficulty Selection */}
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--spacing-xs)',
            }}>
              {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  className={`btn ${difficulty === d ? 'btn-primary' : ''}`}
                  onClick={() => setDifficulty(d)}
                  style={{ fontSize: 'var(--font-xs)' }}
                >
                  {d === 'Easy' && '😊'} 
                  {d === 'Medium' && '🤔'} 
                  {d === 'Hard' && '😤'} 
                  {d === 'Expert' && '🔥'} {d}
                </button>
              ))}
            </div>
          </div>
          
          {/* Symmetry Selection */}
          <div className="form-group">
            <label className="form-label">Symmetry</label>
            <select
              className="form-select"
              value={symmetry}
              onChange={(e) => setSymmetry(e.target.value as Symmetry)}
            >
              <option value="rotational">↻ Rotational (180°)</option>
              <option value="horizontal">↔ Horizontal Mirror</option>
              <option value="vertical">↕ Vertical Mirror</option>
              <option value="diagonal">⤢ Diagonal</option>
              <option value="none">✕ None</option>
            </select>
          </div>
          
          {/* Preview */}
          <div style={{ 
            marginTop: 'var(--spacing-md)', 
            padding: 'var(--spacing-md)', 
            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
            border: '2px solid var(--grid-lines)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: 'var(--font-xs)', 
              color: 'var(--text-muted)', 
              marginBottom: 'var(--spacing-sm)',
              fontFamily: 'Press Start 2P, monospace',
              letterSpacing: '2px'
            }}>
              PREVIEW
            </div>
            <div style={{ 
              fontSize: 'var(--font-xl)', 
              color: 'var(--cyan)',
              fontFamily: 'VT323, monospace',
              textShadow: '0 0 10px var(--cyan-glow)'
            }}>
              {randomSize ? '?×?' : `${selectedSize}×${selectedSize}`} • {difficulty}
            </div>
            <div style={{ 
              fontSize: 'var(--font-md)', 
              color: 'var(--magenta)',
              marginTop: 'var(--spacing-xs)'
            }}>
              {symmetry} symmetry
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStart}>
            ▶ Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
