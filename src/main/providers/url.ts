import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

const URL_PATTERN = /^(https?:\/\/|www\.)\S+$/;

export class UrlProvider implements SearchProvider {
  category: CategoryName = 'URL';

  async search(query: string, _limit: number): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!URL_PATTERN.test(trimmed)) return [];

    const url = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;

    return [
      {
        category: 'URL',
        title: trimmed,
        subtitle: 'Open URL',
        icon: '🌐',
        kind: 'URL',
        action: { type: 'open_url', url },
      },
    ];
  }
}
