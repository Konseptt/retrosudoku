/**
 * VictoryModal Component
 * Celebration screen when puzzle is completed
 */

import { useEffect, useState } from 'react';
import { Difficulty } from '../types';

interface VictoryModalProps {
  isOpen: boolean;
  time: number;
  difficulty: Difficulty;
  size: number;
  isNewRecord: boolean;
  solverTimeMs?: number;
  onClose: () => void;
  onNewGame: () => void;
  onShare: () => void;
}

export function VictoryModal({
  isOpen,
  time,
  difficulty,
  size,
  isNewRecord,
  solverTimeMs,
  onClose,
  onNewGame,
  onShare,
}: VictoryModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const getMessage = () => {
    const timeInSeconds = time / 1000;
    if (difficulty === 'Expert' && timeInSeconds < 120) {
      return 'LEGENDARY! You crushed Expert mode!';
    }
    if (isNewRecord) {
      return 'NEW PERSONAL BEST!';
    }
    if (timeInSeconds < 60) {
      return 'BLAZING FAST!';
    }
    if (timeInSeconds < 180) {
      return 'EXCELLENT WORK!';
    }
    return 'NICE WORK, RETRO CHAMP!';
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {showConfetti && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  background: ['var(--cyan)', 'var(--magenta)', 'var(--yellow)', 'var(--green)', 'var(--peach)'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animation: `confetti-fall ${1 + Math.random() * 2}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="victory-screen">
          <h2 className="victory-title">{getMessage()}</h2>
          
          <div className="victory-stats">
            <div className="victory-stat">
              <span className="victory-stat-label">Time</span>
              <span className={`victory-stat-value ${isNewRecord ? 'new-record' : ''}`}>
                {formatTime(time)} {isNewRecord && '🏆'}
              </span>
            </div>
            
            <div className="victory-stat">
              <span className="victory-stat-label">Difficulty</span>
              <span className="victory-stat-value">{difficulty}</span>
            </div>
            
            <div className="victory-stat">
              <span className="victory-stat-label">Grid Size</span>
              <span className="victory-stat-value">{size}×{size}</span>
            </div>
            
            {solverTimeMs !== undefined && (
              <div className="victory-stat">
                <span className="victory-stat-label">Solver Time</span>
                <span className="victory-stat-value">{solverTimeMs.toFixed(1)} ms</span>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={onShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <button className="btn btn-primary" onClick={onNewGame}>
              Play Again
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
