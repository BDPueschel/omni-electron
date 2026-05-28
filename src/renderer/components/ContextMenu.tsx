import { useState, useEffect } from 'react';
import type { SearchResult, ResultAction } from '../../shared/types';
import { Icon } from './Icon';

interface ContextAction {
  label: string;
  action: ResultAction | { type: 'bookmark' } | { type: 'unbookmark' };
  icon?: string;
}

export function getContextActions(result: SearchResult, isBookmarked: boolean): ContextAction[] {
  const actions: ContextAction[] = [];

  actions.push({
    label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
    action: isBookmarked ? { type: 'unbookmark' } : { type: 'bookmark' },
    icon: 'star',
  });

  if (result.action.type === 'open') {
    actions.push({ label: 'Open', action: result.action, icon: 'file' });
    actions.push({
      label: 'Open containing folder',
      action: { type: 'open', path: result.action.path.replace(/[/\\][^/\\]+$/, '') || '/' },
      icon: 'folder',
    });
    actions.push({
      label: 'Copy path',
      action: { type: 'copy', text: result.action.path },
      icon: 'clipboard',
    });
  } else if (result.action.type === 'copy') {
    actions.push({ label: 'Copy', action: result.action, icon: 'clipboard' });
  } else if (result.action.type === 'open_url') {
    actions.push({ label: 'Open URL', action: result.action, icon: 'globe' });
    actions.push({
      label: 'Copy URL',
      action: { type: 'copy', text: result.action.url },
      icon: 'clipboard',
    });
  }

  return actions;
}

interface ContextMenuProps {
  result: SearchResult;
  selectedActionIndex: number;
  onExecute: (action: ResultAction) => void;
  onBookmark: () => void;
  onUnbookmark: () => void;
}

export function ContextMenu({ result, selectedActionIndex, onExecute, onBookmark, onUnbookmark }: ContextMenuProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const path = result.action.type === 'open' ? result.action.path : result.subtitle;
    window.omni.isBookmarked(path).then(setIsBookmarked);
  }, [result]);

  const actions = getContextActions(result, isBookmarked);

  const handleAction = (action: ContextAction['action']) => {
    if (action.type === 'bookmark') {
      onBookmark();
    } else if (action.type === 'unbookmark') {
      onUnbookmark();
    } else {
      onExecute(action as ResultAction);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-0 py-2 px-3">
      <div className="text-omni-muted text-xs mb-2 truncate">Actions for: {result.title}</div>
      {actions.map((item, i) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
            i === selectedActionIndex
              ? 'bg-omni-accent-bg text-omni-accent border-l-2 border-l-[rgba(130,180,255,0.6)]'
              : 'text-omni-text hover:bg-white/[0.04] border-l-2 border-l-transparent'
          }`}
          onClick={() => handleAction(item.action)}
        >
          {item.icon && <span style={{ color: 'var(--color-omni-accent)', opacity: 0.6 }}><Icon name={item.icon} size={12} /></span>}
          {item.label}
        </div>
      ))}
    </div>
  );
}
