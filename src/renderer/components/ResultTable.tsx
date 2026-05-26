import type { GroupedResults, SortColumn, SortDirection } from '../../shared/types';
import { GroupHeader } from './GroupHeader';
import { ResultRow } from './ResultRow';

interface ResultTableProps {
  grouped: GroupedResults[];
  selectedIndex: number;
  multiSelected: Set<number>;
  activeCategory: string | null;
  expandedCategory: string | null;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onExecute: (index: number) => void;
}

export function ResultTable({
  grouped,
  selectedIndex,
  multiSelected,
  activeCategory,
  expandedCategory,
  onExecute,
}: ResultTableProps) {
  let globalIndex = 0;

  return (
    <div className="flex-1 overflow-y-auto min-h-0 py-1">
      {grouped.map((group) => {
        const startIndex = globalIndex;
        const rows = group.results.map((result, i) => {
          const idx = startIndex + i;
          return (
            <ResultRow
              key={`${group.category}-${i}`}
              result={result}
              isSelected={idx === selectedIndex}
              isMultiSelected={multiSelected.has(idx)}
              onClick={() => onExecute(idx)}
            />
          );
        });
        globalIndex += group.results.length;

        return (
          <div key={group.category}>
            <GroupHeader
              category={group.category}
              count={group.results.length}
              isActive={group.category === activeCategory}
              isExpanded={group.category === expandedCategory}
            />
            {rows}
          </div>
        );
      })}
    </div>
  );
}
