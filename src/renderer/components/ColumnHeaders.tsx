import type { SortColumn, SortDirection } from '../../shared/types';

interface ColumnHeadersProps {
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'NAME' },
  { key: 'location', label: 'LOCATION' },
  { key: 'size', label: 'SIZE' },
  { key: 'modified', label: 'MODIFIED' },
  { key: 'kind', label: 'KIND' },
];

export function ColumnHeaders({ sortColumn, sortDirection, onSort }: ColumnHeadersProps) {
  return (
    <div
      className="grid items-center px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/30 border-b border-omni-separator shrink-0 select-none"
      style={{ gridTemplateColumns: '24px 1fr minmax(100px, 1fr) 70px 100px 60px' }}
    >
      <span />
      {COLUMNS.map((col) => (
        <span
          key={col.key}
          onClick={() => onSort(col.key)}
          className="cursor-pointer hover:text-white/50 transition-colors"
        >
          {col.label}
          {sortColumn === col.key && (
            <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
          )}
        </span>
      ))}
    </div>
  );
}
