interface BatchContextMenuProps {
  count: number;
  selectedAction: number;
  onExecute: (actionLabel: string) => void;
}

const BATCH_ACTIONS = [
  'Open all',
  'Copy all paths',
  'Copy all to...',
  'Move all to...',
  'Delete all',
];

export function BatchContextMenu({ count, selectedAction, onExecute }: BatchContextMenuProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 py-2 px-3">
      <div className="text-omni-muted text-xs mb-2">Batch actions for {count} selected items</div>
      {BATCH_ACTIONS.map((label, i) => (
        <div
          key={label}
          className={`px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
            i === selectedAction
              ? 'bg-omni-accent-bg text-omni-accent border-l-2 border-l-[rgba(130,180,255,0.6)]'
              : 'text-omni-text hover:bg-white/[0.04] border-l-2 border-l-transparent'
          }`}
          onClick={() => onExecute(label)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
