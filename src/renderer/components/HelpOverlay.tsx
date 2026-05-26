const NAV_SHORTCUTS = [
  { keys: '↑ / ↓', description: 'Move selection' },
  { keys: 'Shift+↑/↓', description: 'Multi-select' },
  { keys: 'Tab', description: 'Next category' },
  { keys: 'Ctrl+↑/↓', description: 'Jump category' },
  { keys: 'Ctrl+E', description: 'Expand category' },
  { keys: 'Home / End', description: 'First / last result' },
  { keys: 'PgUp / PgDn', description: 'Scroll 10 rows' },
  { keys: 'Escape', description: 'Close / go back' },
];

const ACTION_SHORTCUTS = [
  { keys: 'Enter', description: 'Execute selected' },
  { keys: 'Shift+→', description: 'Open context menu' },
  { keys: 'Ctrl+C', description: 'Copy path' },
  { keys: 'Ctrl+Space', description: 'Toggle preview' },
  { keys: 'Ctrl+1–5', description: 'Sort by column' },
  { keys: 'Ctrl+H', description: 'Toggle this help' },
];

export function HelpOverlay() {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4">
      <div className="text-omni-text text-sm font-medium mb-3">Keyboard Shortcuts</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <div>
          <div className="text-omni-muted text-xs uppercase tracking-wider mb-2">Navigation</div>
          {NAV_SHORTCUTS.map(({ keys, description }) => (
            <div key={keys} className="flex items-center gap-2 py-1">
              <kbd className="text-xs font-mono bg-white/10 text-omni-accent px-1.5 py-0.5 rounded shrink-0">
                {keys}
              </kbd>
              <span className="text-omni-muted text-xs">{description}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-omni-muted text-xs uppercase tracking-wider mb-2">Actions</div>
          {ACTION_SHORTCUTS.map(({ keys, description }) => (
            <div key={keys} className="flex items-center gap-2 py-1">
              <kbd className="text-xs font-mono bg-white/10 text-omni-accent px-1.5 py-0.5 rounded shrink-0">
                {keys}
              </kbd>
              <span className="text-omni-muted text-xs">{description}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-center text-omni-muted text-xs">
        Press <kbd className="font-mono bg-white/10 text-omni-accent px-1.5 py-0.5 rounded">Ctrl+H</kbd> to close
      </div>
    </div>
  );
}
