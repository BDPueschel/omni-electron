import { useCallback } from 'react';
import type { GroupedResults, SortColumn } from '../../shared/types';

interface UseKeyboardConfig {
  grouped: GroupedResults[];
  selectedIndex: number;
  multiSelected: Set<number>;
  expandedCategory: string | null;
  contextMenuOpen: boolean;
  previewOpen: boolean;
  helpOpen: boolean;
  // selection actions
  moveDown: () => void;
  moveUp: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  shiftMoveDown: () => void;
  shiftMoveUp: () => void;
  clearMultiSelect: () => void;
  // callbacks
  onExecute: (index: number) => void;
  onExpandCategory: (category: string) => void;
  onCollapseCategory: () => void;
  onOpenContextMenu: () => void;
  onCloseContextMenu: () => void;
  onTogglePreview: () => void;
  onToggleHelp: () => void;
  onSort: (column: SortColumn) => void;
  onCopyPath: () => void;
  onHide: () => void;
}

const SORT_KEYS: Record<string, SortColumn> = {
  '1': 'name',
  '2': 'location',
  '3': 'size',
  '4': 'modified',
  '5': 'kind',
};

export function useKeyboard(config: UseKeyboardConfig) {
  const {
    grouped,
    selectedIndex,
    multiSelected,
    expandedCategory,
    contextMenuOpen,
    previewOpen,
    helpOpen,
    moveDown,
    moveUp,
    jumpToStart,
    jumpToEnd,
    shiftMoveDown,
    shiftMoveUp,
    clearMultiSelect,
    onExecute,
    onExpandCategory,
    onCollapseCategory,
    onOpenContextMenu,
    onCloseContextMenu,
    onTogglePreview,
    onToggleHelp,
    onSort,
    onCopyPath,
    onHide,
  } = config;

  const getActiveCategory = useCallback((): string | null => {
    let count = 0;
    for (const g of grouped) {
      if (count + g.results.length > selectedIndex) return g.category;
      count += g.results.length;
    }
    return null;
  }, [grouped, selectedIndex]);

  const jumpToNextCategory = useCallback(() => {
    let count = 0;
    for (let gi = 0; gi < grouped.length; gi++) {
      const g = grouped[gi];
      if (count + g.results.length > selectedIndex) {
        // currently in group gi, jump to start of next group
        const nextGroup = grouped[gi + 1];
        if (nextGroup) {
          onExpandCategory(nextGroup.category);
        }
        return;
      }
      count += g.results.length;
    }
  }, [grouped, selectedIndex, onExpandCategory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key, shiftKey, ctrlKey } = e;

    // Ctrl+key combos
    if (ctrlKey) {
      switch (key) {
        case 'ArrowDown':
          e.preventDefault();
          jumpToNextCategory();
          return;
        case 'ArrowUp': {
          e.preventDefault();
          // Jump to start of current category
          let count = 0;
          for (const g of grouped) {
            if (count + g.results.length > selectedIndex) {
              onExpandCategory(g.category);
              return;
            }
            count += g.results.length;
          }
          return;
        }
        case 'c':
        case 'C':
          e.preventDefault();
          onCopyPath();
          return;
        case 'e':
        case 'E':
          e.preventDefault();
          {
            const cat = getActiveCategory();
            if (cat) onExpandCategory(cat);
          }
          return;
        case 'h':
        case 'H':
          e.preventDefault();
          onToggleHelp();
          return;
        case ' ':
          e.preventDefault();
          onTogglePreview();
          return;
        default:
          if (SORT_KEYS[key]) {
            e.preventDefault();
            onSort(SORT_KEYS[key]);
            return;
          }
      }
    }

    switch (key) {
      case 'ArrowDown':
        e.preventDefault();
        if (shiftKey) {
          shiftMoveDown();
        } else {
          moveDown();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (shiftKey) {
          shiftMoveUp();
        } else {
          moveUp();
        }
        break;
      case 'Tab':
        e.preventDefault();
        jumpToNextCategory();
        break;
      case 'Home':
        e.preventDefault();
        jumpToStart();
        break;
      case 'End':
        e.preventDefault();
        jumpToEnd();
        break;
      case 'PageUp':
        e.preventDefault();
        // Jump back 10
        for (let i = 0; i < 10; i++) moveUp();
        break;
      case 'PageDown':
        e.preventDefault();
        // Jump forward 10
        for (let i = 0; i < 10; i++) moveDown();
        break;
      case 'Enter':
        e.preventDefault();
        onExecute(selectedIndex);
        break;
      case 'Escape':
        e.preventDefault();
        // Priority chain: preview > help > context > expanded > multi-select > hide
        if (previewOpen) {
          onTogglePreview();
        } else if (helpOpen) {
          onToggleHelp();
        } else if (contextMenuOpen) {
          onCloseContextMenu();
        } else if (expandedCategory) {
          onCollapseCategory();
        } else if (multiSelected.size > 0) {
          clearMultiSelect();
        } else {
          onHide();
        }
        break;
      case 'ArrowRight':
        if (shiftKey) {
          e.preventDefault();
          onOpenContextMenu();
        }
        break;
      case 'ArrowLeft':
        if (shiftKey) {
          e.preventDefault();
          onCloseContextMenu();
        }
        break;
    }
  }, [
    grouped,
    selectedIndex,
    multiSelected,
    expandedCategory,
    contextMenuOpen,
    previewOpen,
    helpOpen,
    moveDown,
    moveUp,
    jumpToStart,
    jumpToEnd,
    shiftMoveDown,
    shiftMoveUp,
    clearMultiSelect,
    jumpToNextCategory,
    getActiveCategory,
    onExecute,
    onExpandCategory,
    onCollapseCategory,
    onOpenContextMenu,
    onCloseContextMenu,
    onTogglePreview,
    onToggleHelp,
    onSort,
    onCopyPath,
    onHide,
  ]);

  return { handleKeyDown };
}
