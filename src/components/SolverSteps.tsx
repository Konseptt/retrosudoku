/**
 * SolverSteps Component
 * Displays step-by-step solving animation with enhanced visualization
 */

import { useEffect, useRef, useState } from 'react';
import { SolveStep } from '../types';

interface SolverStepsProps {
  steps: SolveStep[];
  currentStep: number;
  isPlaying: boolean;
  speed?: number;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onClose: () => void;
}

export function SolverSteps({
  steps,
  currentStep,
  isPlaying,
  onStepChange,
  onPlayPause,
  onClose,
}: SolverStepsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  
  useEffect(() => {
    // Auto-scroll to current step
    if (listRef.current) {
      const stepElement = listRef.current.children[currentStep] as HTMLElement;
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStep]);
  
  if (steps.length === 0) {
    return null;
  }

  const formatCellPosition = (cellIndex: number, size: number = 9) => {
    const row = Math.floor(cellIndex / size) + 1;
    const col = (cellIndex % size) + 1;
    return `R${row}C${col}`;
  };
  
  return (
    <div className="control-panel solver-panel">
      <div className="control-panel-header">
        <span className="control-panel-title">🔍 Auto-Solve Steps</span>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      
      {/* Progress */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="progress-bar vintage">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
          />
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--spacing-sm)',
        }}>
          <span style={{ fontSize: 'var(--font-md)', color: 'var(--text-muted)', fontFamily: 'VT323, monospace' }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--cyan)', fontFamily: 'VT323, monospace' }}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Step Indicator Dots */}
      <div className="step-indicators">
        {steps.slice(0, Math.min(steps.length, 20)).map((_, index) => (
          <div
            key={index}
            className={`step-dot ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            onClick={() => onStepChange(index)}
            title={`Step ${index + 1}`}
          />
        ))}
        {steps.length > 20 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            +{steps.length - 20} more
          </span>
        )}
      </div>
      
      {/* Playback Controls */}
      <div className="solver-controls">
        <button
          className="btn btn-icon"
          onClick={() => onStepChange(0)}
          disabled={currentStep === 0}
          aria-label="First step"
          title="First Step"
        >
          ⏮
        </button>
        <button
          className="btn btn-icon"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          aria-label="Previous step"
          title="Previous Step"
        >
          ⏪
        </button>
        <button
          className={`btn btn-icon ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
          style={{ minWidth: '50px' }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          className="btn btn-icon"
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep >= steps.length - 1}
          aria-label="Next step"
          title="Next Step"
        >
          ⏩
        </button>
        <button
          className="btn btn-icon"
          onClick={() => onStepChange(steps.length - 1)}
          disabled={currentStep >= steps.length - 1}
          aria-label="Last step"
          title="Last Step"
        >
          ⏭
        </button>
      </div>

      {/* Speed Control */}
      <div className="solver-speed-control" style={{ justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
        <span>🐢</span>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={1100 - playbackSpeed}
          onChange={(e) => setPlaybackSpeed(1100 - parseInt(e.target.value))}
          title={`Speed: ${playbackSpeed}ms`}
        />
        <span>🐇</span>
      </div>
      
      {/* Current Step Detail */}
      {steps[currentStep] && (
        <div className="solver-step active" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="solver-step-type">
            <span className="solver-step-number">{currentStep + 1}</span>
            {steps[currentStep].type}
          </div>
          <div className="solver-step-explanation">
            {steps[currentStep].explanation}
          </div>
          {steps[currentStep].cells && steps[currentStep].cells.length > 0 && (
            <div className="solver-step-cells">
              <span style={{ color: 'var(--text-muted)', marginRight: 'var(--spacing-xs)' }}>Cells:</span>
              {steps[currentStep].cells.map((cell, idx) => (
                <span key={idx} className="solver-cell-badge">
                  {formatCellPosition(cell)}
                </span>
              ))}
            </div>
          )}
          {steps[currentStep].values && steps[currentStep].values.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--green)' }}>
              Value{steps[currentStep].values.length > 1 ? 's' : ''}: {steps[currentStep].values.join(', ')}
            </div>
          )}
        </div>
      )}
      
      {/* Steps List */}
      <div 
        ref={listRef}
        className="solver-steps-container"
        style={{ maxHeight: '200px' }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            className={`solver-step ${index === currentStep ? 'active' : ''}`}
            style={{
              cursor: 'pointer',
              opacity: index <= currentStep ? 1 : 0.4,
              transform: index === currentStep ? 'scale(1)' : 'scale(0.98)',
              marginBottom: 'var(--spacing-xs)',
            }}
            onClick={() => onStepChange(index)}
          >
            <div className="solver-step-type" style={{ fontSize: 'var(--font-xs)' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                background: index <= currentStep ? 'var(--green)' : 'var(--grid-lines)',
                color: index <= currentStep ? 'var(--bg-primary)' : 'var(--text-muted)',
                borderRadius: '50%',
                fontSize: '0.6rem',
                marginRight: 'var(--spacing-xs)',
              }}>
                {index < currentStep ? '✓' : index + 1}
              </span>
              {step.type}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {currentStep >= steps.length - 1 && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 255, 0.1))',
          border: '2px solid var(--green)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--spacing-xs)' }}>
            🎉 Solving Complete!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)' }}>
            {steps.length} steps used
          </div>
        </div>
      )}
    </div>
  );
}
