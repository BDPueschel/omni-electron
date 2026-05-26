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

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
      let processes: ProcessEntry[];
      if (process.platform === 'darwin' || process.platform === 'linux') {
        processes = await this.loadMacProcesses();
      } else if (process.platform === 'win32') {
        processes = await this.loadWindowsProcesses();
      } else {
        return [];
      }

      const matches = processes
        .filter(p => p.name.toLowerCase().includes(q))
        .slice(0, limit);

      return matches.map(p => ({
        category: 'Processes',
        title: p.name,
        subtitle: `PID ${p.pid} · ${formatMemory(p.memoryMB)}`,
        icon: '⚙️',
        kind: 'Proc',
        action: { type: 'kill_process' as const, pid: p.pid, name: p.name },
      }));
    } catch {
      return [];
    }
  }

  private async loadMacProcesses(): Promise<ProcessEntry[]> {
    const { stdout } = await execFileAsync('ps', ['-axo', 'pid,rss,comm']);
    const lines = stdout.split('\n').slice(1); // Skip header
    const entries: ProcessEntry[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Format: PID RSS COMM (comm may have spaces)
      const match = trimmed.match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (!match) continue;

      const pid = parseInt(match[1], 10);
      const rssKb = parseInt(match[2], 10);
      const comm = match[3].trim();
      const name = comm.split('/').pop() ?? comm;
      const memoryMB = rssKb / 1024;

      entries.push({ pid, name, memoryMB });
    }
    return entries;
  }

  private async loadWindowsProcesses(): Promise<ProcessEntry[]> {
    const { stdout } = await execFileAsync('tasklist', ['/fo', 'csv', '/nh']);
    const lines = stdout.split('\r\n').filter(Boolean);
    const entries: ProcessEntry[] = [];

    for (const line of lines) {
      // CSV format: "name","pid","session","num","mem"
      const parts = line.split('","');
      if (parts.length < 5) continue;

      const name = parts[0].replace(/^"/, '');
      const pid = parseInt(parts[1], 10);
      // Memory field like "1,234 K"
      const memStr = parts[4].replace(/[^0-9]/g, '');
      const memoryKB = parseInt(memStr, 10) || 0;
      const memoryMB = memoryKB / 1024;

      if (!isNaN(pid)) {
        entries.push({ pid, name, memoryMB });
      }
    }
    return entries;
  }
}
