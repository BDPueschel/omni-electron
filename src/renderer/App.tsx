import { useState } from 'react';
import { SearchInput } from './components/SearchInput';
import { ColumnHeaders } from './components/ColumnHeaders';
import { ResultTable } from './components/ResultTable';
import { StatusBar } from './components/StatusBar';
import { useSearch } from './hooks/useSearch';
import type { SortColumn, SortDirection } from '../shared/types';

export function App() {
  const { query, setQuery, grouped, flatResults } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getActiveCategory = (): string | null => {
    let count = 0;
    for (const g of grouped) {
      if (count + g.results.length > selectedIndex) return g.category;
      count += g.results.length;
    }
    return null;
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExecute = (index: number) => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (e.shiftKey) setMultiSelected((prev) => new Set([...prev, selectedIndex]));
        setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.shiftKey) setMultiSelected((prev) => new Set([...prev, selectedIndex]));
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        handleExecute(selectedIndex);
        break;
      case 'Escape':
        e.preventDefault();
        if (multiSelected.size > 0) {
          setMultiSelected(new Set());
        } else if (expandedCategory) {
          setExpandedCategory(null);
        } else {
          window.omni.hideWindow();
        }
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(flatResults.length - 1);
        break;
    }
  };

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
