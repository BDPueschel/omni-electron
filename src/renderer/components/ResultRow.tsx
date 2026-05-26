import type { SearchResult } from '../../shared/types';

interface ResultRowProps {
  result: SearchResult;
  isSelected: boolean;
  isMultiSelected: boolean;
  onClick: () => void;
}

export function ResultRow({ result, isSelected, isMultiSelected, onClick }: ResultRowProps) {
  const baseClass = 'grid items-center px-2 py-[5px] cursor-pointer transition-colors text-xs font-mono';
  const selectedClass = isSelected
    ? 'bg-omni-accent-bg border-l-2 border-l-[rgba(130,180,255,0.6)]'
    : isMultiSelected
    ? 'bg-omni-multi-bg border-l-2 border-l-omni-multi-border'
    : 'border-l-2 border-l-transparent hover:bg-white/[0.04]';

  return (
    <div
      className={`${baseClass} ${selectedClass}`}
      style={{ gridTemplateColumns: '24px 1fr minmax(100px, 1fr) 70px 100px 60px' }}
      onClick={onClick}
    >
      <span className="text-sm text-center">{result.icon}</span>
      <span className={`truncate ${isSelected ? 'text-omni-accent' : 'text-omni-text'}`}>
        {result.title}
      </span>
      <span className="truncate text-omni-muted">{result.subtitle}</span>
      <span className="text-omni-muted">{result.size ?? '--'}</span>
      <span className="text-omni-muted">{result.modified ?? '--'}</span>
      <span className="text-white/25">{result.kind}</span>
    </div>
  );
}
