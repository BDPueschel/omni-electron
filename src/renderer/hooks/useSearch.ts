import { useState, useCallback, useRef, useEffect } from 'react';
import type { SearchResult, GroupedResults } from '../../shared/types';
import { CATEGORY_ORDER } from '../../shared/types';

const SYSTEM_COMMANDS: SearchResult[] = [
  { category: 'System', title: 'Lock Screen', subtitle: 'Lock the workstation', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'lock_screen' } },
  { category: 'System', title: 'Sleep', subtitle: 'Suspend the computer', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'sleep' } },
  { category: 'System', title: 'Shutdown', subtitle: 'Shut down the computer', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'shutdown' } },
  { category: 'System', title: 'Restart', subtitle: 'Restart the computer', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'restart' } },
  { category: 'System', title: 'Sign Out', subtitle: 'Sign out of current user', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'sign_out' } },
  { category: 'System', title: 'Empty Recycle Bin', subtitle: 'Clear the recycle bin', icon: 'settings', kind: 'System', action: { type: 'system_command', command: 'empty_trash' } },
];

export function useSearch() {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const genRef = useRef(0);

  const loadHomeScreen = useCallback(() => {
    const gen = ++genRef.current;
    window.omni.getBookmarks()
      .then(bookmarks => {
        if (genRef.current === gen) setResults([...bookmarks, ...SYSTEM_COMMANDS]);
      })
      .catch(() => {
        if (genRef.current === gen) setResults([...SYSTEM_COMMANDS]);
      });
  }, []);

  useEffect(() => {
    const cleanup = window.omni.onWindowShown(() => {
      setQueryState('');
      loadHomeScreen();
    });
    return cleanup;
  }, [loadHomeScreen]);

  useEffect(() => {
    loadHomeScreen();
  }, [loadHomeScreen]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!value.trim()) {
      loadHomeScreen();
      return;
    }

    const gen = ++genRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await window.omni.search(value);
        if (genRef.current === gen) setResults(res);
      } catch {
        if (genRef.current === gen) setResults([]);
      }
    }, 50);
  }, [loadHomeScreen]);

  const grouped: GroupedResults[] = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      results: results.filter((r) => r.category === cat),
    }))
    .filter((g) => g.results.length > 0);

  const flatResults = grouped.flatMap((g) => g.results);

  return { query, setQuery, results, grouped, flatResults, refreshBookmarks: loadHomeScreen };
}
