import { useState, useCallback, useRef } from 'react';
import type { SearchResult, GroupedResults } from '../../shared/types';
import { CATEGORY_ORDER } from '../../shared/types';

export function useSearch() {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      window.omni.getFrequent()
        .then((frequent) => setResults(frequent))
        .catch(() => setResults([]));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await window.omni.search(value);
        setResults(res);
      } catch {
        setResults([]);
      }
    }, 50);
  }, []);

  const grouped: GroupedResults[] = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      results: results.filter((r) => r.category === cat),
    }))
    .filter((g) => g.results.length > 0);

  const flatResults = grouped.flatMap((g) => g.results);

  return { query, setQuery, results, grouped, flatResults };
}
