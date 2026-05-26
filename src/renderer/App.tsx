import { useState, useCallback } from 'react';
import { SearchInput } from './components/SearchInput';
import { ColumnHeaders } from './components/ColumnHeaders';
import { ResultTable } from './components/ResultTable';
import { StatusBar } from './components/StatusBar';
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
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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

  const handleExecute = useCallback((index: number) => {
    const result = flatResults[index];
    if (result) {
      window.omni.execute(result.action);
      window.omni.recordSelection({
        query,
        resultPath: result.subtitle,
        category: result.category,
        title: result.title,
      });
    }
  }, [flatResults, query]);

  const handleExpandCategory = useCallback((category: string) => {
    setExpandedCategory(category);
  }, []);

  const handleCollapseCategory = useCallback(() => {
    setExpandedCategory(null);
  }, []);

  const handleOpenContextMenu = useCallback(() => {
    setContextMenuOpen(true);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuOpen(false);
  }, []);

  const handleTogglePreview = useCallback(() => {
    setPreviewOpen((prev) => !prev);
  }, []);

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
    onExecute: handleExecute,
    onExpandCategory: handleExpandCategory,
    onCollapseCategory: handleCollapseCategory,
    onOpenContextMenu: handleOpenContextMenu,
    onCloseContextMenu: handleCloseContextMenu,
    onTogglePreview: handleTogglePreview,
    onToggleHelp: handleToggleHelp,
    onSort: handleSort,
    onCopyPath: handleCopyPath,
    onHide: handleHide,
  });

  return (
    <div className="w-full h-full bg-omni-bg text-omni-text font-sans flex flex-col">
      <SearchInput value={query} onInput={setQuery} onKeyDown={handleKeyDown} />
      {flatResults.length > 0 ? (
        <>
          <ColumnHeaders sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
          <ResultTable
            grouped={grouped}
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
      ) : query.trim() ? (
        <div className="text-center py-6 text-white/30 text-sm">No results found</div>
      ) : null}
    </div>
  );
}
