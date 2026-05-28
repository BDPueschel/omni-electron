import type { SearchResult } from '../../shared/types';

interface StatusBarProps {
  totalResults: number;
  selectedResult: SearchResult | null;
  multiSelectedCount: number;
}

export function StatusBar({ totalResults, selectedResult, multiSelectedCount }: StatusBarProps) {
  let text: string;
  if (multiSelectedCount > 0) {
    text = `${multiSelectedCount + 1} items selected · Shift+→ for batch actions`;
  } else if (selectedResult) {
    text = selectedResult.subtitle
      ? `${totalResults} results · ${selectedResult.subtitle}`
      : `${totalResults} results`;
  } else {
    text = `${totalResults} results`;
  }

  return (
    <div className="px-3 py-1 text-[10px] text-white/20 border-t border-white/[0.04] truncate shrink-0 text-right">
      {text}
    </div>
  );
}
