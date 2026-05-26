import type { SearchResult, ResultAction } from '../../shared/types';

interface ContextAction {
  label: string;
  action: ResultAction;
}

export function getContextActions(result: SearchResult): ContextAction[] {
  const actions: ContextAction[] = [];

  if (result.action.type === 'open') {
    actions.push({ label: 'Open', action: result.action });
    actions.push({
      label: 'Open containing folder',
      action: { type: 'open', path: result.action.path.replace(/[/\\][^/\\]+$/, '') || '/' },
    });
    actions.push({
      label: 'Copy path',
      action: { type: 'copy', text: result.action.path },
    });
  } else if (result.action.type === 'copy') {
    actions.push({ label: 'Copy', action: result.action });
  }

  return actions;
}

interface ContextMenuProps {
  result: SearchResult;
  selectedActionIndex: number;
  onExecute: (action: ResultAction) => void;
}

export function ContextMenu({ result, selectedActionIndex, onExecute }: ContextMenuProps) {
  const actions = getContextActions(result);

  return (
    <div className="flex-1 overflow-y-auto min-h-0 py-2 px-3">
      <div className="text-omni-muted text-xs mb-2 truncate">Actions for: {result.title}</div>
      {actions.map((item, i) => (
        <div
          key={item.label}
          className={`px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
            i === selectedActionIndex
              ? 'bg-omni-accent-bg text-omni-accent border-l-2 border-l-[rgba(130,180,255,0.6)]'
              : 'text-omni-text hover:bg-white/[0.04] border-l-2 border-l-transparent'
          }`}
          onClick={() => onExecute(item.action)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
