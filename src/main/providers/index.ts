import { SearchProvider, SearchResult, GroupedResults, CategoryName, CATEGORY_ORDER, OmniConfig } from '../../shared/types';
import { MathProvider } from './math';
import { UrlProvider } from './url';
import { WebProvider } from './web';
import { ColorProvider } from './color';
import { SystemProvider } from './system';

export { MathProvider } from './math';
export { UrlProvider } from './url';
export { WebProvider } from './web';
export { ColorProvider } from './color';
export { SystemProvider } from './system';

export class ProviderRegistry {
  private providers: SearchProvider[];
  private webProvider: WebProvider;

  constructor() {
    this.webProvider = new WebProvider();
    this.providers = [
      new MathProvider(),
      new UrlProvider(),
      this.webProvider,
      new ColorProvider(),
      new SystemProvider(),
    ];
  }

  addProvider(provider: SearchProvider): void {
    this.providers.push(provider);
  }

  updateConfig(config: Partial<OmniConfig>): void {
    if (config.searchEngine) {
      this.webProvider.setEngine(config.searchEngine);
    }
  }

  async search(query: string, limit: number): Promise<GroupedResults[]> {
    const settled = await Promise.allSettled(
      this.providers.map(p => p.search(query, limit)),
    );

    const byCategory = new Map<CategoryName, SearchResult[]>();

    this.providers.forEach((provider, i) => {
      const outcome = settled[i];
      if (outcome.status === 'fulfilled' && outcome.value.length > 0) {
        const existing = byCategory.get(provider.category) ?? [];
        byCategory.set(provider.category, [...existing, ...outcome.value]);
      }
    });

    return CATEGORY_ORDER.filter(cat => byCategory.has(cat)).map(cat => ({
      category: cat,
      results: (byCategory.get(cat) ?? []).slice(0, limit),
    }));
  }

  async expand(query: string, category: string): Promise<SearchResult[]> {
    const provider = this.providers.find(p => p.category === category);
    if (!provider) return [];

    if (provider.expand) {
      return provider.expand(query);
    }

    return provider.search(query, 100);
  }
}
