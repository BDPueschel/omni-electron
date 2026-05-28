import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

interface ClipEntry {
  text: string;
  addedAt: Date;
}

export class ClipboardProvider implements SearchProvider {
  category: CategoryName = 'Clipboard';

  private history: ClipEntry[] = [];
  private readonly MAX_HISTORY = 50;
  private watchInterval: ReturnType<typeof setInterval> | null = null;

  startWatching(intervalMs = 1000): void {
    if (this.watchInterval) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { clipboard } = require('electron') as typeof import('electron');

    let lastText = '';
    try {
      lastText = clipboard.readText();
    } catch {
      // Ignore initial read errors
    }

    this.watchInterval = setInterval(() => {
      try {
        const current = clipboard.readText();
        if (current && current !== lastText) {
          lastText = current;
          this.history.unshift({ text: current, addedAt: new Date() });
          if (this.history.length > this.MAX_HISTORY) {
            this.history.length = this.MAX_HISTORY;
          }
        }
      } catch {
        // Ignore clipboard read errors
      }
    }, intervalMs);
  }

  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
  }

  private formatAge(date: Date): string {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  }

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    let matches: ClipEntry[];

    try {
      const { Fzf } = await import('fzf');
      const fzf = new Fzf(this.history, { selector: (item: ClipEntry) => item.text });
      matches = fzf.find(q).map((r: { item: ClipEntry }) => r.item).slice(0, limit);
    } catch {
      const ql = q.toLowerCase();
      matches = this.history
        .filter(entry => entry.text.toLowerCase().includes(ql))
        .slice(0, limit);
    }

    return matches.map((entry, idx) => {
      const preview = entry.text.length > 80
        ? entry.text.slice(0, 80) + '…'
        : entry.text;
      return {
        category: 'Clipboard',
        title: preview,
        subtitle: `Clipboard #${idx + 1} (${this.formatAge(entry.addedAt)})`,
        icon: 'clipboard',
        kind: 'Clip',
        action: { type: 'copy' as const, text: entry.text },
      };
    });
  }
}
