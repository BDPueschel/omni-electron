import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

export class MathProvider implements SearchProvider {
  category: CategoryName = 'Math';

  async search(query: string, _limit: number): Promise<SearchResult[]> {
    const trimmed = query.trim();

    // Must contain at least one digit and at least one operator
    const hasDigit = /\d/.test(trimmed);
    const hasOperator = /[+\-*/^%()]/.test(trimmed);
    if (!hasDigit || !hasOperator) return [];

    try {
      const sanitized = trimmed.replace(/[^0-9+\-*/^%().\s]/g, '');
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || !isFinite(result)) return [];

      const resultStr = String(result);
      return [
        {
          category: 'Math',
          title: resultStr,
          subtitle: `= ${trimmed}`,
          icon: '🧮',
          kind: 'Math',
          action: { type: 'copy', text: resultStr },
        },
      ];
    } catch {
      return [];
    }
  }
}
