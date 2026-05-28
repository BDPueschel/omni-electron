import { useCallback } from 'react';
import type { GroupedResults, SortColumn } from '../../shared/types';

interface UseKeyboardConfig {
  grouped: GroupedResults[];
  selectedIndex: number;
  multiSelected: Set<number>;
  expandedCategory: string | null;
  contextMenuIndex: number | null;
  contextActionIndex: number;
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
  onContextActionUp: () => void;
  onContextActionDown: () => void;
  onExecuteContextAction: () => void;
  onTogglePreview: () => void;
  onToggleHelp: () => void;
  onSort: (column: SortColumn) => void;
  onCopyPath: () => void;
  onHide: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
  setSelectedIndex: (index: number) => void;
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
    contextMenuIndex,
    contextActionIndex,
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
    onContextActionUp,
    onContextActionDown,
    onExecuteContextAction,
    onTogglePreview,
    onToggleHelp,
    onSort,
    onCopyPath,
    onHide,
    onToggleSettings,
    settingsOpen,
    setSelectedIndex,
  } = config;

  const getActiveCategory = useCallback((): string | null => {
    let count = 0;
    for (const g of grouped) {
      if (count + g.results.length > selectedIndex) return g.category;
      count += g.results.length;
    }
    return null;
  }, [grouped, selectedIndex]);

  const getCategoryBounds = useCallback(() => {
    let count = 0;
    for (const g of grouped) {
      const end = count + g.results.length - 1;
      if (selectedIndex >= count && selectedIndex <= end) {
        return { start: count, end };
      }
      count = end + 1;
    }
    return { start: 0, end: 0 };
  }, [grouped, selectedIndex]);

  const getNextCategoryStart = useCallback(() => {
    let count = 0;
    for (let i = 0; i < grouped.length; i++) {
      count += grouped[i].results.length;
      if (count > selectedIndex && i + 1 < grouped.length) return count;
    }
    return grouped.flatMap(g => g.results).length - 1;
  }, [grouped, selectedIndex]);

  const getPrevCategoryEnd = useCallback(() => {
    let count = 0;
    for (let i = 0; i < grouped.length; i++) {
      const start = count;
      count += grouped[i].results.length;
      if (start > 0 && selectedIndex < count && selectedIndex >= start) return start - 1;
    }
    return 0;
  }, [grouped, selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key, shiftKey, ctrlKey } = e;

    // Context menu mode: intercept navigation keys
    if (contextMenuIndex !== null) {
      switch (key) {
        case 'ArrowDown':
          e.preventDefault();
          onContextActionDown();
          return;
        case 'ArrowUp':
          e.preventDefault();
          onContextActionUp();
          return;
        case 'Enter':
          e.preventDefault();
          onExecuteContextAction();
          return;
        case 'Escape':
          e.preventDefault();
          onCloseContextMenu();
          return;
        case 'ArrowLeft':
          if (shiftKey) {
            e.preventDefault();
            onCloseContextMenu();
          }
          return;
      }
      return;
    }

    // Ctrl+key combos
    if (ctrlKey) {
      switch (key) {
        case 'ArrowDown': {
          e.preventDefault();
          const bounds = getCategoryBounds();
          if (selectedIndex === bounds.end) {
            const next = getNextCategoryStart();
            setSelectedIndex(Math.min(next, grouped.flatMap(g => g.results).length - 1));
          } else {
            setSelectedIndex(bounds.end);
          }
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const bounds = getCategoryBounds();
          if (selectedIndex === bounds.start) {
            setSelectedIndex(Math.max(getPrevCategoryEnd(), 0));
          } else {
            setSelectedIndex(bounds.start);
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
        case ',':
          e.preventDefault();
          onToggleSettings();
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
      case 'Tab': {
        e.preventDefault();
        const next = getNextCategoryStart();
        const total = grouped.flatMap(g => g.results).length;
        setSelectedIndex(Math.min(next, total - 1));
        break;
      }
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
        if (shiftKey) {
          onOpenContextMenu();
        } else {
          onExecute(selectedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (settingsOpen) {
          onToggleSettings();
        } else if (previewOpen) {
          onTogglePreview();
        } else if (helpOpen) {
          onToggleHelp();
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
    contextMenuIndex,
    contextActionIndex,
    previewOpen,
    helpOpen,
    moveDown,
    moveUp,
    jumpToStart,
    jumpToEnd,
    shiftMoveDown,
    shiftMoveUp,
    clearMultiSelect,
    getNextCategoryStart,
    getCategoryBounds,
    getPrevCategoryEnd,
    setSelectedIndex,
    getActiveCategory,
    onExecute,
    onExpandCategory,
    onCollapseCategory,
    onOpenContextMenu,
    onCloseContextMenu,
    onContextActionUp,
    onContextActionDown,
    onExecuteContextAction,
    onTogglePreview,
    onToggleHelp,
    onSort,
    onCopyPath,
    onHide,
    onToggleSettings,
    settingsOpen,
  ]);

  return { handleKeyDown };
}
