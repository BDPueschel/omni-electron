import { useState, useCallback, useMemo, useEffect } from 'react';
import { SearchInput } from './components/SearchInput';
import { ColumnHeaders } from './components/ColumnHeaders';
import { ResultTable } from './components/ResultTable';
import { StatusBar } from './components/StatusBar';
import { ContextMenu, getContextActions } from './components/ContextMenu';
import { BatchContextMenu } from './components/BatchContextMenu';
import { PreviewPanel } from './components/PreviewPanel';
import type { PreviewData } from './components/PreviewPanel';
import { HelpOverlay } from './components/HelpOverlay';
import { useSearch } from './hooks/useSearch';
import { useSelection } from './hooks/useSelection';
import { useKeyboard } from './hooks/useKeyboard';
import type { SortColumn, SortDirection } from '../shared/types';

export function App() {
  const { query, setQuery, grouped, flatResults } = useSearch();

  const {
    selectedIndex,
    multiSelected,
    moveDown,
    moveUp,
    jumpToStart,
    jumpToEnd,
    shiftMoveDown,
    shiftMoveUp,
    clearMultiSelect,
  } = useSelection(flatResults.length);

  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [contextMenuIndex, setContextMenuIndex] = useState<number | null>(null);
  const [contextActionIndex, setContextActionIndex] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const sortedGrouped = useMemo(() => {
    if (!sortColumn) return grouped;
    return grouped.map((group) => ({
      ...group,
      results: [...group.results].sort((a, b) => {
        let aVal: string;
        let bVal: string;
        switch (sortColumn) {
          case 'name':
            aVal = a.title;
            bVal = b.title;
            break;
          case 'location':
            aVal = a.subtitle;
            bVal = b.subtitle;
            break;
          case 'size':
            aVal = a.size ?? '';
            bVal = b.size ?? '';
            break;
          case 'modified':
            aVal = a.modified ?? '';
            bVal = b.modified ?? '';
            break;
          case 'kind':
            aVal = a.kind;
            bVal = b.kind;
            break;
          default:
            return 0;
        }
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDirection === 'asc' ? cmp : -cmp;
      }),
    }));
  }, [grouped, sortColumn, sortDirection]);

  useEffect(() => {
    let height: number;

    if (previewData) {
      height = 500;
    } else if (helpOpen) {
      height = 420;
    } else if (contextMenuIndex !== null) {
      height = 52 + 28 * 3 + 32 * 3;
    } else if (flatResults.length > 0) {
      const groupCount = sortedGrouped.length;
      const rowCount = flatResults.length;
      height = 52 + 28 + groupCount * 28 + rowCount * 32 + 24;
    } else if (query.trim()) {
      height = 52 + 52;
    } else {
      height = 52;
    }

    if (window.omni?.resizeWindow) {
      window.omni.resizeWindow(height);
    }
  }, [previewData, helpOpen, contextMenuIndex, flatResults, sortedGrouped, query]);

  const getActiveCategory = (): string | null => {
    let count = 0;
    for (const g of grouped) {
      if (count + g.results.length > selectedIndex) return g.category;
      count += g.results.length;
    }
    return null;
  };

  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return column;
    });
  }, []);

  const DESTRUCTIVE_SYSTEM_COMMANDS = new Set(['shutdown', 'restart', 'sign_out']);

  const handleExecute = useCallback((index: number) => {
    const result = flatResults[index];
    if (!result) return;

    // Confirm destructive actions before executing
    const action = result.action;
    if (action.type === 'system_command' && DESTRUCTIVE_SYSTEM_COMMANDS.has(action.command)) {
      const confirmed = window.confirm(`Are you sure you want to ${result.title.toLowerCase()}?`);
      if (!confirmed) return;
    } else if (action.type === 'kill_process') {
      const confirmed = window.confirm(`Kill process "${action.name}" (PID ${action.pid})?`);
      if (!confirmed) return;
    }

    window.omni.execute(action);
    window.omni.recordSelection({
      query,
      resultPath: result.subtitle,
      category: result.category,
      title: result.title,
    });
  }, [flatResults, query]);

  const handleExpandCategory = useCallback((category: string) => {
    setExpandedCategory(category);
  }, []);

  const handleCollapseCategory = useCallback(() => {
    setExpandedCategory(null);
  }, []);

  const handleOpenContextMenu = useCallback(() => {
    setContextMenuIndex(selectedIndex);
    setContextActionIndex(0);
  }, [selectedIndex]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuIndex(null);
    setContextActionIndex(0);
  }, []);

  const handleContextActionUp = useCallback(() => {
    setContextActionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleContextActionDown = useCallback(() => {
    const result = contextMenuIndex !== null ? flatResults[contextMenuIndex] : null;
    if (!result) return;
    const actions = getContextActions(result);
    setContextActionIndex((prev) => Math.min(actions.length - 1, prev + 1));
  }, [contextMenuIndex, flatResults]);

  const handleExecuteContextAction = useCallback(() => {
    if (contextMenuIndex === null) return;
    const result = flatResults[contextMenuIndex];
    if (!result) return;
    const actions = getContextActions(result);
    const action = actions[contextActionIndex];
    if (action) {
      window.omni.execute(action.action);
      handleCloseContextMenu();
    }
  }, [contextMenuIndex, contextActionIndex, flatResults, handleCloseContextMenu]);

  const handleTogglePreview = useCallback(async () => {
    if (previewData) {
      setPreviewData(null);
      return;
    }
    const result = flatResults[selectedIndex];
    if (!result) return;
    const filePath = result.action.type === 'open' ? result.action.path : result.subtitle;
    const data = await window.omni.previewFile(filePath);
    if (data) setPreviewData(data as PreviewData);
  }, [previewData, flatResults, selectedIndex]);

  const handleToggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

  const handleCopyPath = useCallback(() => {
    const result = flatResults[selectedIndex];
    if (result) {
      window.omni.execute({ type: 'copy', text: result.subtitle });
    }
  }, [flatResults, selectedIndex]);

  const handleHide = useCallback(() => {
    window.omni.hideWindow();
  }, []);

  const { handleKeyDown } = useKeyboard({
    grouped,
    selectedIndex,
    multiSelected,
    expandedCategory,
    contextMenuIndex,
    contextActionIndex,
    previewOpen: previewData !== null,
    helpOpen,
    moveDown,
    moveUp,
    jumpToStart,
    jumpToEnd,
    shiftMoveDown,
    shiftMoveUp,
    clearMultiSelect,
    onExecute: handleExecute,
    onExpandCategory: handleExpandCategory,
    onCollapseCategory: handleCollapseCategory,
    onOpenContextMenu: handleOpenContextMenu,
    onCloseContextMenu: handleCloseContextMenu,
    onContextActionUp: handleContextActionUp,
    onContextActionDown: handleContextActionDown,
    onExecuteContextAction: handleExecuteContextAction,
    onTogglePreview: handleTogglePreview,
    onToggleHelp: handleToggleHelp,
    onSort: handleSort,
    onCopyPath: handleCopyPath,
    onHide: handleHide,
  });

  const renderMain = () => {
    if (previewData) {
      return <PreviewPanel data={previewData} />;
    }
    if (helpOpen) {
      return <HelpOverlay />;
    }
    if (contextMenuIndex !== null) {
      const result = flatResults[contextMenuIndex];
      if (result) {
        if (multiSelected.size > 0) {
          return (
            <BatchContextMenu
              count={multiSelected.size}
              selectedAction={contextActionIndex}
              onExecute={(_label) => handleCloseContextMenu()}
            />
          );
        }
        return (
          <ContextMenu
            result={result}
            selectedActionIndex={contextActionIndex}
            onExecute={(action) => {
              window.omni.execute(action);
              handleCloseContextMenu();
            }}
          />
        );
      }
    }
    if (flatResults.length > 0) {
      return (
        <>
          <ColumnHeaders sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
          <ResultTable
            grouped={sortedGrouped}
            selectedIndex={selectedIndex}
            multiSelected={multiSelected}
            activeCategory={getActiveCategory()}
            expandedCategory={expandedCategory}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onExecute={handleExecute}
          />
          <StatusBar
            totalResults={flatResults.length}
            selectedResult={flatResults[selectedIndex] ?? null}
            multiSelectedCount={multiSelected.size}
          />
        </>
      );
    }
    if (query.trim()) {
      return <div className="text-center py-6 text-white/30 text-sm">No results found</div>;
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-omni-bg text-omni-text font-sans flex flex-col">
      <SearchInput value={query} onInput={setQuery} onKeyDown={handleKeyDown} />
      {renderMain()}
    </div>
  );
}
