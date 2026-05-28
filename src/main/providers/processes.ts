import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface ProcessEntry {
  pid: number;
  name: string;
  memoryMB: number;
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export class ProcessesProvider implements SearchProvider {
  category: CategoryName = 'Processes';

  private cache: ProcessEntry[] = [];
  private lastRefresh = 0;
  private refreshing = false;
  private readonly TTL_MS = 3000;

  private async refreshCache(): Promise<void> {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      if (process.platform === 'win32') {
        this.cache = await this.loadWindowsProcesses();
      } else if (process.platform === 'darwin' || process.platform === 'linux') {
        this.cache = await this.loadMacProcesses();
      }
      this.lastRefresh = Date.now();
    } finally {
      this.refreshing = false;
    }
  }

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    if (Date.now() - this.lastRefresh > this.TTL_MS) {
      this.refreshCache();
    }

    if (this.cache.length === 0) return [];

    const matches = this.cache
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, limit);

    return matches.map(p => ({
      category: 'Processes',
      title: p.name,
      subtitle: `PID ${p.pid} · ${formatMemory(p.memoryMB)}`,
      icon: 'settings',
      kind: 'Proc',
      action: { type: 'kill_process' as const, pid: p.pid, name: p.name },
    }));
  }

  async warmUp(): Promise<void> {
    await this.refreshCache();
  }

  private async loadMacProcesses(): Promise<ProcessEntry[]> {
    const { stdout } = await execFileAsync('ps', ['-axo', 'pid,rss,comm']);
    const lines = stdout.split('\n').slice(1);
    const entries: ProcessEntry[] = [];
    for (const line of lines) {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (!match) continue;
      const pid = parseInt(match[1], 10);
      const rssKb = parseInt(match[2], 10);
      const name = (match[3].trim().split('/').pop() ?? match[3]).trim();
      entries.push({ pid, name, memoryMB: rssKb / 1024 });
    }
    return entries;
  }

  private async loadWindowsProcesses(): Promise<ProcessEntry[]> {
    const { stdout } = await execFileAsync('tasklist', ['/fo', 'csv', '/nh']);
    const lines = stdout.split('\r\n').filter(Boolean);
    const entries: ProcessEntry[] = [];
    for (const line of lines) {
      const parts = line.split('","');
      if (parts.length < 5) continue;
      const name = parts[0].replace(/^"/, '');
      const pid = parseInt(parts[1], 10);
      const memStr = parts[4].replace(/[^0-9]/g, '');
      const memoryMB = (parseInt(memStr, 10) || 0) / 1024;
      if (!isNaN(pid)) entries.push({ pid, name, memoryMB });
    }
    return entries;
  }
}
