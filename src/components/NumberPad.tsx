/**
 * NumberPad Component
 * Input buttons for entering numbers
 */



interface NumberPadProps {
  size: number;
  isPencilMode: boolean;
  onNumberClick: (num: number) => void;
  onClear: () => void;
}

export function NumberPad({ size, isPencilMode, onNumberClick, onClear }: NumberPadProps) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  
  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <span className="control-panel-title">Numbers</span>
        {isPencilMode && <span className="pixel-text" style={{ color: 'var(--yellow)' }}>✏️ Pencil</span>}
      </div>
      <div className={`number-pad size-${size}`}>
        {numbers.map((num) => (
          <button
            key={num}
            className={`number-btn ${isPencilMode ? 'pencil-mode' : ''}`}
            onClick={() => onNumberClick(num)}
            aria-label={`Enter ${num}${isPencilMode ? ' as pencil mark' : ''}`}
          >
            {num <= 9 ? num : num.toString(16).toUpperCase()}
          </button>
        ))}
        <button
          className="number-btn"
          onClick={onClear}
          aria-label="Clear cell"
          style={{ gridColumn: size <= 6 ? 'span 2' : 'span 1' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
