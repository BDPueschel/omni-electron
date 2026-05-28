import type { SearchResult } from '../../shared/types';
import { Icon } from './Icon';

interface ResultRowProps {
  result: SearchResult;
  isSelected: boolean;
  isMultiSelected: boolean;
  onClick: () => void;
}

export function ResultRow({ result, isSelected, isMultiSelected, onClick }: ResultRowProps) {
  const selectedClass = isSelected
    ? 'bg-omni-accent-bg border-l-2 border-l-[rgba(130,180,255,0.6)]'
    : isMultiSelected
    ? 'bg-omni-multi-bg border-l-2 border-l-omni-multi-border'
    : 'border-l-2 border-l-transparent hover:bg-white/[0.04]';

  return (
    <div
      className={`grid items-center px-2 py-[5px] cursor-pointer transition-colors font-mono ${selectedClass}`}
      style={{
        gridTemplateColumns: '24px 1fr minmax(100px, 1fr) 70px 100px 60px',
        animation: 'slideIn var(--anim-duration, 100ms) ease-out',
        fontSize: 11,
      }}
      onClick={onClick}
    >
      <span className="text-center" style={{ color: 'var(--color-omni-accent)' }}><Icon name={result.icon} /></span>
      <span className={`truncate ${isSelected ? 'text-omni-accent' : 'text-omni-text'}`}>
        {result.title}
      </span>
      <span className="truncate text-omni-muted">{result.subtitle}</span>
      <span className="text-omni-muted text-right">{result.size ?? '--'}</span>
      <span className="text-omni-muted text-right">{result.modified ?? '--'}</span>
      <span className="text-white/25 text-right">{result.kind}</span>
    </div>
  );
}
