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
import { searchEverything, setEverythingPort } from './everything';
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
  private useEverything: boolean;

  constructor() {
    this.webProvider = new WebProvider();
    this.useEverything = process.platform === 'win32';

    this.providers = [
      new MathProvider(),
      new UrlProvider(),
      this.webProvider,
      new ColorProvider(),
      new SystemProvider(),
      new AppsProvider(),
      ...(this.useEverything
        ? []
        : [new FileProvider(), new DirectoryProvider()]),
      new ClipboardProvider(),
      new ProcessesProvider(),
    ];
  }

  getClipboardProvider(): ClipboardProvider | undefined {
    return this.providers.find(p => p.category === 'Clipboard') as ClipboardProvider | undefined;
  }

  async warmUp(): Promise<void> {
    const appsProvider = this.providers.find(p => p instanceof AppsProvider) as AppsProvider | undefined;
    await appsProvider?.warmUp();
  }

  addProvider(provider: SearchProvider): void {
    this.providers.push(provider);
  }

  updateConfig(config: Partial<OmniConfig>): void {
    if (config.searchEngine) {
      this.webProvider.setEngine(config.searchEngine);
    }
    if (config.everythingPort) {
      setEverythingPort(config.everythingPort);
    }
  }

  async search(query: string, limit: number): Promise<GroupedResults[]> {
    const parsed = parseQuery(query);

    const effectiveQuery = parsed.isRegex
      ? query
      : parsed.orGroups.length > 0
        ? query
        : parsed.terms.join(' ') || query;

    const everythingPromise = this.useEverything
      ? searchEverything(effectiveQuery, limit)
      : null;

    const providerPromises = this.providers.map(p => {
      if (p instanceof FileProvider) {
        return p.search(effectiveQuery, limit, parsed.pathScope, parsed.wildcardExt ?? undefined);
      }
      return p.search(effectiveQuery, limit);
    });

    const [evResult, ...providerResults] = await Promise.all([
      everythingPromise ? everythingPromise.catch(() => null) : Promise.resolve(null),
      ...providerPromises.map(p => p.catch(() => [] as SearchResult[])),
    ]);

    const byCategory = new Map<CategoryName, SearchResult[]>();

    if (evResult) {
      if (evResult.files.length > 0) byCategory.set('Files', evResult.files);
      if (evResult.directories.length > 0) byCategory.set('Directories', evResult.directories);
    }

    this.providers.forEach((provider, i) => {
      const results = providerResults[i];
      if (results.length > 0) {
        let filtered = results;

        if (parsed.negations.length > 0) {
          filtered = filtered.filter(r => {
            const haystack = (r.title + ' ' + r.subtitle).toLowerCase();
            return !parsed.negations.some(neg => haystack.includes(neg.toLowerCase()));
          });
        }

        if (filtered.length > 0) {
          const existing = byCategory.get(provider.category) ?? [];
          byCategory.set(provider.category, [...existing, ...filtered]);
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
