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

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      let filePaths: string[];
      if (process.platform === 'darwin') {
        filePaths = await this.searchMac(q, limit);
      } else if (process.platform === 'win32') {
        filePaths = await this.searchWindows(q, limit);
      } else {
        return [];
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

  private async searchMac(query: string, limit: number): Promise<string[]> {
    const { stdout } = await execFileAsync('mdfind', [
      '-name', query,
      '-limit', String(limit),
    ]);
    return stdout.split('\n').filter(Boolean);
  }

  private async searchWindows(query: string, limit: number): Promise<string[]> {
    const { stdout } = await execFileAsync('es.exe', [
      '-n', String(limit),
      '-s', query,
    ]);
    return stdout.split('\r\n').filter(Boolean);
  }
}
