// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../hooks/useSearch';

const mockSearch = vi.fn().mockResolvedValue([]);
const mockGetFrequent = vi.fn().mockResolvedValue([]);

beforeEach(() => {
  vi.clearAllMocks();
  window.omni = {
    search: mockSearch,
    getFrequent: mockGetFrequent,
  } as any;
});

describe('useSearch', () => {
  it('starts with empty query and results', () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
  });

  it('calls search API on query change with debounce', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSearch());

    act(() => result.current.setQuery('test'));
    expect(mockSearch).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(60); });
    expect(mockSearch).toHaveBeenCalledWith('test');

    vi.useRealTimers();
  });

  it('loads frequent items when query is cleared', async () => {
    const { result } = renderHook(() => useSearch());
    await act(async () => result.current.setQuery(''));
    expect(mockGetFrequent).toHaveBeenCalled();
  });
});
