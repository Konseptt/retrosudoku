/**
 * SavedGamesModal Component
 * List and manage saved games
 */

import React, { useEffect, useState } from 'react';
import { SavedGame } from '../types';
import { getAllSavedGames, deleteSavedGame } from '../storage';

interface SavedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (game: SavedGame) => void;
}

export function SavedGamesModal({ isOpen, onClose, onLoad }: SavedGamesModalProps) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      loadGames();
    }
  }, [isOpen]);
  
  const loadGames = async () => {
    setLoading(true);
    const savedGames = await getAllSavedGames();
    setGames(savedGames);
    setLoading(false);
  };
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSavedGame(id);
    loadGames();
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Saved Games</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : games.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
              No saved games yet
            </div>
          ) : (
            <div className="saved-games-list">
              {games.map(game => (
                <div
                  key={game.id}
                  className="saved-game-item"
                  onClick={() => {
                    onLoad(game);
                    onClose();
                  }}
                >
                  <div className="saved-game-info">
                    <div className="saved-game-name">
                      {game.name || `${game.puzzle.size}×${game.puzzle.size} ${game.puzzle.difficulty}`}
                    </div>
                    <div className="saved-game-meta">
                      {formatDate(game.savedAt)} • {formatTime(game.elapsedTime)}
                    </div>
                  </div>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={(e) => handleDelete(game.id, e)}
                    aria-label="Delete saved game"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
