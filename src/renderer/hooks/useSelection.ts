import { useState, useCallback } from 'react';

export function useSelection(totalItems: number) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());

  const clamp = useCallback((i: number) => Math.max(0, Math.min(i, totalItems - 1)), [totalItems]);

  const moveDown = useCallback(() => setSelectedIndex((i) => clamp(i + 1)), [clamp]);
  const moveUp = useCallback(() => setSelectedIndex((i) => clamp(i - 1)), [clamp]);
  const jumpToStart = useCallback(() => setSelectedIndex(0), []);
  const jumpToEnd = useCallback(() => setSelectedIndex(clamp(totalItems - 1)), [clamp, totalItems]);
  const jumpTo = useCallback((i: number) => setSelectedIndex(clamp(i)), [clamp]);

  const shiftMoveDown = useCallback(() => {
    setMultiSelected((prev) => { const next = new Set(prev); next.add(selectedIndex); return next; });
    moveDown();
  }, [selectedIndex, moveDown]);

  const shiftMoveUp = useCallback(() => {
    setMultiSelected((prev) => { const next = new Set(prev); next.add(selectedIndex); return next; });
    moveUp();
  }, [selectedIndex, moveUp]);

  const clearMultiSelect = useCallback(() => setMultiSelected(new Set()), []);
  const reset = useCallback(() => { setSelectedIndex(0); setMultiSelected(new Set()); }, []);

  return { selectedIndex, multiSelected, moveDown, moveUp, jumpToStart, jumpToEnd, jumpTo, shiftMoveDown, shiftMoveUp, clearMultiSelect, reset };
}
