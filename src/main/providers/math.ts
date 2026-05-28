import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import { Parser } from 'expr-eval';

const parser = new Parser();

const MATH_FUNCTIONS = ['sqrt', 'sin', 'cos', 'tan', 'abs', 'ln', 'log', 'exp', 'ceil', 'floor', 'round'];
const OPERATORS = /[+\-*/^%]/;
const FUNC_CALL = /[a-z]+\(/;

function isMathExpression(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const startsValid = /^[\d.(]/.test(q) || MATH_FUNCTIONS.some(fn => q.startsWith(fn));
  if (!startsValid) return false;

  return OPERATORS.test(q) || FUNC_CALL.test(q);
}

function formatResult(value: number): string {
  if (!isFinite(value)) return String(value);
  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return String(value);
  }
  return value.toFixed(10).replace(/\.?0+$/, '');
}

export class MathProvider implements SearchProvider {
  category: CategoryName = 'Math';

  async search(query: string, _limit: number): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!isMathExpression(trimmed)) return [];

    try {
      const result = parser.evaluate(trimmed);
      if (typeof result !== 'number' || !isFinite(result)) return [];

      const resultStr = formatResult(result);
      return [
        {
          category: 'Math',
          title: resultStr,
          subtitle: `${trimmed} =`,
          icon: 'math',
          kind: 'Math',
          action: { type: 'copy', text: resultStr },
        },
      ];
    } catch {
      return [];
    }
  }
}
