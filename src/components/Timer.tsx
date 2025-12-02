/**
 * Timer Component
 * Game timer display with pause functionality
 */

import { useEffect, useState, useCallback } from 'react';

interface TimerProps {
  startTime: number;
  elapsedTime: number;
  isPaused: boolean;
  isComplete: boolean;
  onPause: () => void;
}

export function Timer({ startTime, elapsedTime, isPaused, isComplete, onPause }: TimerProps) {
  const [displayTime, setDisplayTime] = useState(0);
  
  useEffect(() => {
    if (isPaused || isComplete) {
      setDisplayTime(elapsedTime);
      return;
    }
    
    const interval = setInterval(() => {
      setDisplayTime(Date.now() - startTime);
    }, 100);
    
    return () => clearInterval(interval);
  }, [startTime, elapsedTime, isPaused, isComplete]);
  
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  return (
    <div className={`timer-display ${isPaused ? 'paused' : ''}`}>
      <svg className="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
      <span aria-live="polite" aria-label={`Time: ${formatTime(displayTime)}`}>
        {formatTime(displayTime)}
      </span>
      <button
        className="btn btn-icon"
        onClick={onPause}
        aria-label={isPaused ? 'Resume' : 'Pause'}
        disabled={isComplete}
      >
        {isPaused ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        )}
      </button>
    </div>
  );
}
