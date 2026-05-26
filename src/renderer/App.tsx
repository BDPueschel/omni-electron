import React from 'react';
import { SearchInput } from './components/SearchInput';
import { useSearch } from './hooks/useSearch';

export function App() {
  const { query, setQuery, flatResults } = useSearch();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.omni.hideWindow();
    }
  };

  return (
    <div className="w-full h-full bg-omni-bg text-omni-text font-sans flex flex-col">
      <SearchInput value={query} onInput={setQuery} onKeyDown={handleKeyDown} />
      {flatResults.length === 0 && query.trim() && (
        <div className="text-center py-6 text-white/30 text-sm">No results found</div>
      )}
    </div>
  );
}
