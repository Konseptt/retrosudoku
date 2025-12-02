/**
 * StatsModal Component
 * Display player statistics and achievements
 */

import { useEffect, useState } from 'react';
import { GameStats } from '../types';
import { getStats } from '../storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<GameStats | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);
  
  const loadStats = async () => {
    const s = await getStats();
    setStats(s);
  };
  
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
  
  const achievementLabels: Record<string, { name: string; icon: string }> = {
    first_win: { name: 'First Victory', icon: '🏆' },
    century: { name: 'Century Club', icon: '💯' },
    week_streak: { name: 'Week Warrior', icon: '📅' },
    month_streak: { name: 'Monthly Master', icon: '🗓️' },
    speed_demon: { name: 'Speed Demon', icon: '⚡' },
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Statistics</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {!stats ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.gamesPlayed}</div>
                  <div className="stat-label">Games Played</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.gamesWon}</div>
                  <div className="stat-label">Games Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {stats.gamesPlayed > 0 
                      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                      : 0}%
                  </div>
                  <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.currentStreak}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.longestStreak}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatTime(stats.totalPlayTime)}</div>
                  <div className="stat-label">Total Play Time</div>
                </div>
              </div>
              
              {/* Best Times */}
              {Object.keys(stats.bestTimes).length > 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Best Times</h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    {Object.entries(stats.bestTimes)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([key, time]) => {
                        const [size, difficulty] = key.split('-');
                        return (
                          <div 
                            key={key}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: 'var(--spacing-sm)',
                              background: 'var(--bg-tertiary)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <span>{size}×{size} {difficulty}</span>
                            <span style={{ color: 'var(--cyan)' }}>{formatTime(time)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
              {/* Achievements */}
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-sm)' }}>
                  {Object.entries(achievementLabels).map(([key, { name, icon }]) => {
                    const unlocked = stats.achievements.includes(key);
                    return (
                      <div
                        key={key}
                        style={{
                          padding: 'var(--spacing-sm)',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          opacity: unlocked ? 1 : 0.4,
                          border: unlocked ? '2px solid var(--yellow)' : '2px solid var(--grid-lines)',
                        }}
                      >
                        <div style={{ fontSize: '2rem' }}>{icon}</div>
                        <div style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--spacing-xs)' }}>
                          {name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
