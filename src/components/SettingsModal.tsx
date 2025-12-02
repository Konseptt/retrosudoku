/**
 * SettingsModal Component
 * App settings and preferences
 */

import { useEffect, useState } from 'react';
import { Theme } from '../types';
import { AppSettings, getSettings, updateSettings } from '../storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);
  
  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };
  
  const handleChange = async (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  if (!isOpen || !settings) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {/* Theme */}
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select
              className="form-select"
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value as Theme)}
            >
              <option value="modern">Clean Modern</option>
              <option value="retro">Retro CRT</option>
              <option value="arcade">Arcade</option>
              <option value="terminal">Terminal</option>
              <option value="cassette">Cassette</option>
            </select>
          </div>
          
          {/* Visual Effects */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="form-label">Visual Effects</label>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="scanlines"
                checked={settings.scanlines}
                onChange={(e) => handleChange('scanlines', e.target.checked)}
              />
              <label htmlFor="scanlines">Scanlines</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="crtGlow"
                checked={settings.crtGlow}
                onChange={(e) => handleChange('crtGlow', e.target.checked)}
              />
              <label htmlFor="crtGlow">CRT Glow</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="highContrast"
                checked={settings.highContrast}
                onChange={(e) => handleChange('highContrast', e.target.checked)}
              />
              <label htmlFor="highContrast">High Contrast (Accessibility)</label>
            </div>
          </div>
          
          {/* Game Options */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="form-label">Game Options</label>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="highlightConflicts"
                checked={settings.highlightConflicts}
                onChange={(e) => handleChange('highlightConflicts', e.target.checked)}
              />
              <label htmlFor="highlightConflicts">Highlight Conflicts</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="highlightSameNumbers"
                checked={settings.highlightSameNumbers}
                onChange={(e) => handleChange('highlightSameNumbers', e.target.checked)}
              />
              <label htmlFor="highlightSameNumbers">Highlight Same Numbers</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="autoRemovePencilMarks"
                checked={settings.autoRemovePencilMarks}
                onChange={(e) => handleChange('autoRemovePencilMarks', e.target.checked)}
              />
              <label htmlFor="autoRemovePencilMarks">Auto-remove Pencil Marks</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="showTimer"
                checked={settings.showTimer}
                onChange={(e) => handleChange('showTimer', e.target.checked)}
              />
              <label htmlFor="showTimer">Show Timer</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="showHints"
                checked={settings.showHints}
                onChange={(e) => handleChange('showHints', e.target.checked)}
              />
              <label htmlFor="showHints">Enable Hints</label>
            </div>
          </div>
          
          {/* Sound */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="form-label">Sound</label>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={settings.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              />
              <label htmlFor="soundEnabled">Sound Effects</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="musicEnabled"
                checked={settings.musicEnabled}
                onChange={(e) => handleChange('musicEnabled', e.target.checked)}
              />
              <label htmlFor="musicEnabled">Background Music</label>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <label style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                Volume: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
