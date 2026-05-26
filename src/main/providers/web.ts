import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

type SearchEngine = 'google' | 'duckduckgo';

export class WebProvider implements SearchProvider {
  category: CategoryName = 'Web';
  private engine: SearchEngine = 'google';

  setEngine(engine: SearchEngine): void {
    this.engine = engine;
  }

  async search(query: string, _limit: number): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const encoded = encodeURIComponent(trimmed);
    const url =
      this.engine === 'duckduckgo'
        ? `https://duckduckgo.com/?q=${encoded}`
        : `https://www.google.com/search?q=${encoded}`;

    const engineLabel = this.engine === 'duckduckgo' ? 'DuckDuckGo' : 'Google';

    return [
      {
        category: 'Web',
        title: `Search ${engineLabel} for "${trimmed}"`,
        subtitle: url,
        icon: '🔎',
        kind: 'Web',
        action: { type: 'open_url', url },
      },
    ];
  }
}
