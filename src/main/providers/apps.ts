import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface AppEntry {
  title: string;
  appPath: string;
}

export class AppsProvider implements SearchProvider {
  category: CategoryName = 'Apps';

  private cache: AppEntry[] = [];
  private lastRefresh = 0;
  private readonly TTL_MS = 60_000;

  async refresh(): Promise<void> {
    try {
      const apps = await this.loadApps();
      this.cache = apps;
      this.lastRefresh = Date.now();
    } catch {
      // Keep existing cache on error
    }
  }

  private async loadApps(): Promise<AppEntry[]> {
    if (process.platform === 'darwin') {
      return this.loadMacApps();
    } else if (process.platform === 'win32') {
      return this.loadWindowsApps();
    }
    return [];
  }

  private loadMacApps(): AppEntry[] {
    const searchDirs = [
      '/Applications',
      '/System/Applications',
      path.join(os.homedir(), 'Applications'),
    ];

    const apps: AppEntry[] = [];
    for (const dir of searchDirs) {
      try {
        if (!fs.existsSync(dir)) continue;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          if (entry.endsWith('.app')) {
            const appPath = path.join(dir, entry);
            const title = entry.replace(/\.app$/, '');
            apps.push({ title, appPath });
          }
        }
      } catch {
        // Skip unreadable directories
      }
    }
    return apps;
  }

  private async loadWindowsApps(): Promise<AppEntry[]> {
    try {
      const { stdout } = await execFileAsync('powershell', [
        '-NoProfile',
        '-Command',
        'Get-StartApps | ConvertTo-Json',
      ]);
      const parsed = JSON.parse(stdout);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map((item: { Name?: string; AppID?: string }) => ({
        title: item.Name ?? '',
        appPath: item.AppID ?? '',
      })).filter(a => a.title);
    } catch {
      return [];
    }
  }

  /** Pre-warm the app cache at startup so first search is instant. */
  async warmUp(): Promise<void> {
    if (this.cache.length === 0) {
      await this.refresh();
    }
  }

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    if (Date.now() - this.lastRefresh > this.TTL_MS || this.cache.length === 0) {
      await this.refresh();
    }

    const ql = q.toLowerCase();
    const matchedApps = this.cache
      .filter(app => app.title.toLowerCase().includes(ql))
      .slice(0, limit);

    return matchedApps.map(app => ({
      category: 'Apps',
      title: app.title,
      subtitle: app.appPath,
      icon: 'app',
      kind: 'App',
      action: { type: 'open' as const, path: app.appPath },
    }));
  }
}
