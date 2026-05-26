import { useState, useEffect } from 'react';
import type { OmniConfig } from '../../shared/types';
import './settings.css';

export function Settings() {
  const [config, setConfig] = useState<OmniConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.omni.getConfig().then((cfg) => setConfig(cfg));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    await window.omni.saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!config) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <h1 className="settings-title">Omni Settings</h1>

      <div className="settings-row">
        <label className="settings-label">Hotkey</label>
        <input
          className="settings-input"
          type="text"
          value={config.hotkey}
          onChange={(e) => setConfig({ ...config, hotkey: e.target.value })}
        />
      </div>

      <div className="settings-row">
        <label className="settings-label">Max Results</label>
        <input
          className="settings-input"
          type="number"
          min={1}
          max={50}
          value={config.maxResultsPerCategory}
          onChange={(e) => setConfig({ ...config, maxResultsPerCategory: Number(e.target.value) })}
        />
      </div>

      <div className="settings-row">
        <label className="settings-label">Search Engine</label>
        <select
          className="settings-input"
          value={config.searchEngine}
          onChange={(e) => setConfig({ ...config, searchEngine: e.target.value as 'google' | 'duckduckgo' })}
        >
          <option value="google">Google</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </div>

      <div className="settings-row">
        <label className="settings-label">Start with OS</label>
        <input
          className="settings-checkbox"
          type="checkbox"
          checked={config.startWithOS}
          onChange={(e) => setConfig({ ...config, startWithOS: e.target.checked })}
        />
      </div>

      <div className="settings-row">
        <label className="settings-label">Theme Opacity ({config.themeOpacity}%)</label>
        <input
          className="settings-slider"
          type="range"
          min={40}
          max={100}
          value={config.themeOpacity}
          onChange={(e) => setConfig({ ...config, themeOpacity: Number(e.target.value) })}
        />
      </div>

      <div className="settings-row">
        <label className="settings-label">Window Width ({config.windowWidth}px)</label>
        <input
          className="settings-slider"
          type="range"
          min={600}
          max={1200}
          value={config.windowWidth}
          onChange={(e) => setConfig({ ...config, windowWidth: Number(e.target.value) })}
        />
      </div>

      <button className="settings-save-btn" onClick={handleSave}>
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
