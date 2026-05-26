import { SearchProvider, SearchResult, GroupedResults, CategoryName, CATEGORY_ORDER, OmniConfig } from '../../shared/types';
import { MathProvider } from './math';
import { UrlProvider } from './url';
import { WebProvider } from './web';
import { ColorProvider } from './color';
import { SystemProvider } from './system';
import { AppsProvider } from './apps';
import { FileProvider } from './files';
import { DirectoryProvider } from './directories';
import { ClipboardProvider } from './clipboard';
import { ProcessesProvider } from './processes';
import { parseQuery } from '../query-parser';

export { MathProvider } from './math';
export { UrlProvider } from './url';
export { WebProvider } from './web';
export { ColorProvider } from './color';
export { SystemProvider } from './system';
export { AppsProvider } from './apps';
export { FileProvider } from './files';
export { DirectoryProvider } from './directories';
export { ClipboardProvider } from './clipboard';
export { ProcessesProvider } from './processes';

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
      new AppsProvider(),
      new FileProvider(),
      new DirectoryProvider(),
      new ClipboardProvider(),
      new ProcessesProvider(),
    ];
  }

  getClipboardProvider(): ClipboardProvider | undefined {
    return this.providers.find(p => p.category === 'Clipboard') as ClipboardProvider | undefined;
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
    const parsed = parseQuery(query);

    // Build the effective query string to pass down to providers.
    // For regex mode pass original; for OR mode pass the full raw query;
    // otherwise join remaining terms (path scope is consumed by FileProvider).
    const effectiveQuery = parsed.isRegex
      ? query
      : parsed.orGroups.length > 0
        ? query
        : parsed.terms.join(' ') || query;

    const settled = await Promise.allSettled(
      this.providers.map(p => {
        // FileProvider gets extra context about pathScope / wildcardExt
        if (p instanceof FileProvider) {
          return p.search(effectiveQuery, limit, parsed.pathScope, parsed.wildcardExt ?? undefined);
        }
        return p.search(effectiveQuery, limit);
      }),
    );

    const byCategory = new Map<CategoryName, SearchResult[]>();

    this.providers.forEach((provider, i) => {
      const outcome = settled[i];
      if (outcome.status === 'fulfilled' && outcome.value.length > 0) {
        let results = outcome.value;

        // Apply negation post-filter
        if (parsed.negations.length > 0) {
          results = results.filter(r => {
            const haystack = (r.title + ' ' + r.subtitle).toLowerCase();
            return !parsed.negations.some(neg => haystack.includes(neg.toLowerCase()));
          });
        }

        if (results.length > 0) {
          const existing = byCategory.get(provider.category) ?? [];
          byCategory.set(provider.category, [...existing, ...results]);
        }
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
