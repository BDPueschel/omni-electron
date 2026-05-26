// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../hooks/useSelection';

describe('useSelection', () => {
  it('initial state: selectedIndex=0, multiSelected empty', () => {
    const { result } = renderHook(() => useSelection(5));
    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.multiSelected.size).toBe(0);
  });

  it('moveDown increments selectedIndex; moveUp decrements', () => {
    const { result } = renderHook(() => useSelection(5));
    act(() => result.current.moveDown());
    expect(result.current.selectedIndex).toBe(1);
    act(() => result.current.moveUp());
    expect(result.current.selectedIndex).toBe(0);
  });

  it('clamps at bounds: moveUp at 0 stays 0; moveDown at last stays at last', () => {
    const { result } = renderHook(() => useSelection(3));
    act(() => result.current.moveUp());
    expect(result.current.selectedIndex).toBe(0);
    act(() => result.current.jumpToEnd());
    expect(result.current.selectedIndex).toBe(2);
    act(() => result.current.moveDown());
    expect(result.current.selectedIndex).toBe(2);
  });

  it('shiftMoveDown adds current index to multiSelected before moving', () => {
    const { result } = renderHook(() => useSelection(5));
    act(() => result.current.shiftMoveDown());
    expect(result.current.multiSelected.has(0)).toBe(true);
    expect(result.current.selectedIndex).toBe(1);
    act(() => result.current.shiftMoveDown());
    expect(result.current.multiSelected.has(1)).toBe(true);
    expect(result.current.selectedIndex).toBe(2);
  });

  it('shiftMoveUp adds current index to multiSelected before moving', () => {
    const { result } = renderHook(() => useSelection(5));
    act(() => result.current.jumpTo(3));
    act(() => result.current.shiftMoveUp());
    expect(result.current.multiSelected.has(3)).toBe(true);
    expect(result.current.selectedIndex).toBe(2);
  });

  it('clearMultiSelect empties multiSelected set', () => {
    const { result } = renderHook(() => useSelection(5));
    act(() => result.current.shiftMoveDown());
    act(() => result.current.shiftMoveDown());
    expect(result.current.multiSelected.size).toBeGreaterThan(0);
    act(() => result.current.clearMultiSelect());
    expect(result.current.multiSelected.size).toBe(0);
  });

  it('jumpToStart and jumpToEnd navigate to first/last index', () => {
    const { result } = renderHook(() => useSelection(5));
    act(() => result.current.jumpTo(3));
    expect(result.current.selectedIndex).toBe(3);
    act(() => result.current.jumpToStart());
    expect(result.current.selectedIndex).toBe(0);
    act(() => result.current.jumpToEnd());
    expect(result.current.selectedIndex).toBe(4);
  });
});
