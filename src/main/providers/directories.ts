import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export class DirectoryProvider implements SearchProvider {
  category: CategoryName = 'Directories';

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      let dirPaths: string[];
      if (process.platform === 'darwin') {
        dirPaths = await this.searchMac(q, limit);
      } else if (process.platform === 'win32') {
        dirPaths = await this.searchWindows(q, limit);
      } else {
        return [];
      }

      const results: SearchResult[] = [];
      for (const dirPath of dirPaths) {
        try {
          const stat = fs.statSync(dirPath);
          if (!stat.isDirectory()) continue;

          results.push({
            category: 'Directories',
            title: path.basename(dirPath),
            subtitle: dirPath,
            icon: 'folder',
            kind: 'Dir',
            size: '--',
            modified: formatDate(stat.mtime),
            action: { type: 'open' as const, path: dirPath },
          });
        } catch {
          // Skip directories we can't stat
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  private async searchMac(query: string, limit: number): Promise<string[]> {
    const { stdout } = await execFileAsync('mdfind', [
      '-name', query,
      '-onlyin', '/',
      '-limit', String(limit),
      'kMDItemContentType == public.folder',
    ]);
    return stdout.split('\n').filter(Boolean);
  }

  private async searchWindows(query: string, limit: number): Promise<string[]> {
    const { stdout } = await execFileAsync('es.exe', [
      '-n', String(limit),
      '-s',
      '-ad', query,
    ]);
    return stdout.split('\r\n').filter(Boolean);
  }
}
