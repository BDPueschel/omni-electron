import { SearchResult } from '../../shared/types';
import http from 'http';

interface EverythingResult {
  type: 'file' | 'folder';
  name: string;
  path?: string;
  size?: string | number;
  date_modified?: string | number;
}

interface EverythingResponse {
  totalResults: number;
  results: EverythingResult[];
}

const WINDOWS_EPOCH_OFFSET = 116444736000000000n;

function filetimeToDate(filetime: number): Date {
  const ft = BigInt(filetime);
  const ms = Number((ft - WINDOWS_EPOCH_OFFSET) / 10000n);
  return new Date(ms);
}

function formatSize(bytes: number): string {
  if (bytes < 0) return '--';
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

const COMMON_EXTENSIONS = new Set([
  'exe', 'dll', 'sys', 'bat', 'cmd', 'ps1', 'msi', 'msp',
  'txt', 'md', 'log', 'csv', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg',
  'js', 'ts', 'tsx', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'cs',
  'html', 'css', 'scss', 'less', 'svg',
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff',
  'mp3', 'wav', 'flac', 'ogg', 'aac', 'wma', 'm4a',
  'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
  'iso', 'img', 'vmdk', 'vhd',
  'lnk', 'url', 'pf', 'evtx',
]);

function toSearchTerms(query: string): string {
  const terms = query.trim().split(/\s+/);
  const regular: string[] = [];
  const extFilters: string[] = [];

  for (const term of terms) {
    if (COMMON_EXTENSIONS.has(term.toLowerCase())) {
      extFilters.push(term.toLowerCase());
    } else {
      regular.push(term);
    }
  }

  let search = regular.join(' ');
  if (extFilters.length > 0) {
    search += ' ext:' + extFilters.join(';');
  }
  return search;
}

function toSearchResult(r: EverythingResult): SearchResult {
  const fullPath = r.path ? `${r.path}\\${r.name}` : r.name;
  const isFolder = r.type === 'folder';

  return {
    category: isFolder ? 'Directories' : 'Files',
    title: r.name,
    subtitle: fullPath,
    icon: isFolder ? 'folder' : 'file',
    kind: isFolder ? 'Dir' : r.name.includes('.') ? r.name.slice(r.name.lastIndexOf('.') + 1).toUpperCase() : 'File',
    size: r.size != null ? formatSize(Number(r.size)) : '--',
    modified: r.date_modified ? formatDate(filetimeToDate(Number(r.date_modified))) : '--',
    action: { type: 'open' as const, path: fullPath },
  };
}

function fetchHttp(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

let everythingPort = 8989;

export function setEverythingPort(port: number): void {
  everythingPort = port;
}

export async function searchEverything(query: string, limit: number): Promise<{ files: SearchResult[]; directories: SearchResult[] }> {
  const q = query.trim();
  if (!q) return { files: [], directories: [] };

  const searchTerms = toSearchTerms(q);
  const params = new URLSearchParams({
    s: searchTerms,
    j: '1',
    path_column: '1',
    size_column: '1',
    date_modified_column: '1',
    c: String(limit * 2),
    sort: 'date_modified',
    ascending: '0',
  });

  try {
    const data = await fetchHttp(`http://127.0.0.1:${everythingPort}/?${params}`);
    const parsed: EverythingResponse = JSON.parse(data);

    const files: SearchResult[] = [];
    const directories: SearchResult[] = [];

    for (const r of parsed.results) {
      const result = toSearchResult(r);
      if (r.type === 'folder') {
        if (directories.length < limit) directories.push(result);
      } else {
        if (files.length < limit) files.push(result);
      }
    }

    return { files, directories };
  } catch {
    return { files: [], directories: [] };
  }
}
