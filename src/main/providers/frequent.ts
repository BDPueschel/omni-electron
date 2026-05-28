import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import { UsageTracker } from '../usage';

export class FrequentProvider implements SearchProvider {
  category: CategoryName = 'Frequent';
  private tracker: UsageTracker;

  constructor(tracker: UsageTracker) {
    this.tracker = tracker;
  }

  async search(_query: string, limit: number): Promise<SearchResult[]> {
    const records = this.tracker.getFrequent(limit);
    return records.map((r) => ({
      category: 'Frequent',
      title: r.title,
      subtitle: r.path,
      action: { type: 'open' as const, path: r.path },
      icon: 'star',
      kind: r.category,
      modified: r.lastUsed,
    }));
  }
}
