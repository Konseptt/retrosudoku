/**
 * Sound Effects for RetroSudoku
 * Chiptune-style audio using Web Audio API
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  
  constructor() {
    // Initialize on first user interaction
  }
  
  private init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    decay: boolean = true
  ) {
    if (!this.enabled) return;
    
    this.init();
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
    
    if (decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
  
  // Number placed
  playPlace() {
    this.playTone(440, 0.1, 'square');
  }
  
  // Pencil mark toggle
  playPencil() {
    this.playTone(880, 0.05, 'square');
  }
  
  // Cell cleared
  playClear() {
    this.playTone(220, 0.1, 'square');
  }
  
  // Error/conflict
  playError() {
    this.playTone(110, 0.2, 'sawtooth');
  }
  
  // Hint received
  playHint() {
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
  }
  
  // Puzzle complete
  playVictory() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square'), i * 150);
    });
  }
  
  // Button click
  playClick() {
    this.playTone(660, 0.05, 'square');
  }
  
  // Undo
  playUndo() {
    this.playTone(330, 0.08, 'square');
  }
  
  // Redo  
  playRedo() {
    this.playTone(440, 0.08, 'square');
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();
