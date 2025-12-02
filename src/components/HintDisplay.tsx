/**
 * HintDisplay Component
 * Shows hints with explanations
 */


import { HintResult } from '../types';

interface HintDisplayProps {
  hint: HintResult | null;
  onApply: () => void;
  onDismiss: () => void;
}

export function HintDisplay({ hint, onApply, onDismiss }: HintDisplayProps) {
  if (!hint) return null;
  
  return (
    <div className="hint-display">
      <div className="hint-type">
        💡 {hint.type}
      </div>
      <div className="hint-explanation">
        {hint.explanation}
      </div>
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginTop: 'var(--spacing-md)' 
      }}>
        <button className="btn btn-primary" onClick={onApply}>
          Apply
        </button>
        <button className="btn" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
