import { useState, useEffect } from 'react';
import type { OmniConfig, OmniTheme } from '../../shared/types';
import { THEME_NAMES, THEME_ACCENTS } from '../themes';
import { applyTheme } from '../themes';

interface InlineSettingsProps {
  onClose: () => void;
}

export function InlineSettings({ onClose }: InlineSettingsProps) {
  const [config, setConfig] = useState<OmniConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.omni.getConfig().then(setConfig);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    await window.omni.saveConfig(config);
    applyTheme(config.theme);
    document.documentElement.style.setProperty('--font-scale', String(config.fontScale ?? 1));
    document.documentElement.style.setProperty('--anim-duration', `${(config.animationScale ?? 0.5) * 200}ms`);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!config) return null;

  const themes = Object.entries(THEME_NAMES) as [OmniTheme, string][];

  return (
    <div className="flex flex-col gap-3" style={{ padding: 20, animation: 'slideIn var(--anim-duration, 100ms) ease-out' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-omni-accent)' }}>Settings</span>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xs">ESC to close</button>
      </div>

      <Section label="General">
        <Row label="Max Results per Category">
          <input className="settings-field" type="number" min={1} max={50} value={config.maxResultsPerCategory}
            onChange={(e) => setConfig({ ...config, maxResultsPerCategory: Number(e.target.value) })} />
        </Row>
        <Row label="Search Engine">
          <select className="settings-field" value={config.searchEngine}
            onChange={(e) => setConfig({ ...config, searchEngine: e.target.value as 'google' | 'duckduckgo' })}>
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>
        </Row>
        <Row label="Start with OS">
          <input type="checkbox" checked={config.startWithOS} className="accent-[var(--color-omni-accent)]"
            onChange={(e) => setConfig({ ...config, startWithOS: e.target.checked })} />
        </Row>
      </Section>

      <Section label="Appearance">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-white/40">Theme</span>
          <div className="grid grid-cols-3 gap-1.5">
            {themes.map(([key, name]) => (
              <button
                key={key}
                onClick={() => setConfig({ ...config, theme: key })}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] transition-colors ${
                  config.theme === key ? 'ring-1' : 'hover:bg-white/[0.04]'
                }`}
                style={{
                  background: config.theme === key ? 'var(--color-omni-accent-bg)' : undefined,
                  ringColor: config.theme === key ? 'var(--color-omni-accent)' : undefined,
                  borderColor: config.theme === key ? 'var(--color-omni-accent)' : 'transparent',
                  border: config.theme === key ? '1px solid var(--color-omni-accent)' : '1px solid transparent',
                }}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: THEME_ACCENTS[key] }} />
                <span className="text-white/70 truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
        <Row label={`Opacity (${config.themeOpacity}%)`}>
          <input type="range" min={40} max={100} value={config.themeOpacity} className="w-28 accent-[var(--color-omni-accent)]"
            onChange={(e) => setConfig({ ...config, themeOpacity: Number(e.target.value) })} />
        </Row>
        <Row label={`Window Width (${config.windowWidth}px)`}>
          <input type="range" min={600} max={1200} value={config.windowWidth} className="w-28 accent-[var(--color-omni-accent)]"
            onChange={(e) => setConfig({ ...config, windowWidth: Number(e.target.value) })} />
        </Row>
        <Row label={`Font Scale (${(config.fontScale ?? 1).toFixed(2)}x)`}>
          <input type="range" min={0.75} max={1.5} step={0.05} value={config.fontScale ?? 1} className="w-28 accent-[var(--color-omni-accent)]"
            onChange={(e) => setConfig({ ...config, fontScale: Number(e.target.value) })} />
        </Row>
        <Row label={`Animation (${(config.animationScale ?? 0.5) === 0 ? 'Instant' : `${Math.round((config.animationScale ?? 0.5) * 200)}ms`})`}>
          <input type="range" min={0} max={1} step={0.1} value={config.animationScale ?? 0.5} className="w-28 accent-[var(--color-omni-accent)]"
            onChange={(e) => setConfig({ ...config, animationScale: Number(e.target.value) })} />
        </Row>
      </Section>

      <Section label="Integration">
        <Row label="Everything HTTP Port">
          <input className="settings-field" type="number" min={1} max={65535} value={config.everythingPort}
            onChange={(e) => setConfig({ ...config, everythingPort: Number(e.target.value) })} />
        </Row>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <button
          onClick={handleSave}
          style={{ width: '33%', padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--color-omni-accent)', border: 'none', cursor: 'pointer' }}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider border-b border-white/[0.04] pb-1" style={{ color: 'var(--color-omni-accent)', opacity: 0.5 }}>{label}</span>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-white/60">{label}</span>
      {children}
    </div>
  );
}
