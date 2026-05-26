import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export class FileProvider implements SearchProvider {
  category: CategoryName = 'Files';

  async search(query: string, limit: number, pathScope?: string, wildcardExt?: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q && !wildcardExt) return [];

    try {
      let filePaths: string[];
      if (process.platform === 'darwin') {
        filePaths = await this.searchMac(q || '*', limit, pathScope);
      } else if (process.platform === 'win32') {
        filePaths = await this.searchWindows(q || '*', limit, pathScope);
      } else {
        return [];
      }

      // Filter by extension when wildcardExt is set
      if (wildcardExt) {
        filePaths = filePaths.filter(fp => {
          const ext = fp.slice(fp.lastIndexOf('.')).toLowerCase();
          return ext === wildcardExt;
        });
      }

      const results: SearchResult[] = [];
      for (const filePath of filePaths) {
        try {
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) continue;

          results.push({
            category: 'Files',
            title: path.basename(filePath),
            subtitle: filePath,
            icon: '📄',
            kind: 'File',
            size: formatSize(stat.size),
            modified: formatDate(stat.mtime),
            action: { type: 'open' as const, path: filePath },
          });
        } catch {
          // Skip files we can't stat
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  private async searchMac(query: string, limit: number, pathScope?: string): Promise<string[]> {
    const args: string[] = [];
    if (pathScope) {
      args.push('-onlyin', pathScope);
    }
    args.push('-name', query, '-limit', String(limit));
    const { stdout } = await execFileAsync('mdfind', args);
    return stdout.split('\n').filter(Boolean);
  }

  private async searchWindows(query: string, limit: number, pathScope?: string): Promise<string[]> {
    const args: string[] = ['-n', String(limit), '-s', query];
    if (pathScope) {
      // Everything search supports path: filter via -path flag
      args.push('-path', pathScope);
    }
    const { stdout } = await execFileAsync('es.exe', args);
    return stdout.split('\r\n').filter(Boolean);
  }
}
