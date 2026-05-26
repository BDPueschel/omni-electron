import { ipcMain, BrowserWindow, shell, clipboard } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from './config';
import { ProviderRegistry } from './providers';
import { UsageTracker } from './usage';
import { ResultAction } from '../shared/types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif']);
const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.js', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml',
  '.toml', '.ini', '.cfg', '.conf', '.sh', '.bash', '.zsh', '.py', '.rb',
  '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp', '.css', '.scss',
  '.html', '.xml', '.svg', '.log', '.env', '.gitignore', '.dockerfile',
]);

export function registerIpcHandlers(
  config: ConfigManager,
  registry: ProviderRegistry,
  tracker: UsageTracker,
  getWindow: () => BrowserWindow | null,
) {
  ipcMain.handle('get-config', () => {
    return config.get();
  });

  ipcMain.handle('save-config', (_event, newConfig) => {
    config.save(newConfig);
    registry.updateConfig(newConfig);
    const win = getWindow();
    if (win) {
      win.setSize(newConfig.windowWidth, win.getBounds().height);
    }
  });

  ipcMain.handle('hide-window', () => {
    const win = getWindow();
    win?.hide();
  });

  ipcMain.handle('search', async (_event, query: string) => {
    const cfg = config.get();
    return registry.search(query, cfg.maxResultsPerCategory);
  });

  ipcMain.handle('execute-action', async (_event, action: ResultAction) => {
    const win = getWindow();

    switch (action.type) {
      case 'open':
        await shell.openPath(action.path);
        break;
      case 'open_url':
        await shell.openExternal(action.url);
        break;
      case 'copy':
        clipboard.writeText(action.text);
        break;
      case 'system_command':
        // executeSystemCommand is implemented in Task 17
        console.log(`[system_command] stub: ${action.command}`);
        break;
      case 'kill_process':
        // Implemented in a later task
        console.log(`[kill_process] stub: pid=${action.pid}`);
        break;
    }

    win?.hide();
  });

  ipcMain.handle('expand-category', async (_event, query: string, category: string) => {
    return registry.expand(query, category);
  });

  ipcMain.handle('get-frequent', async () => {
    const records = tracker.getFrequent(10);
    return records.map((r) => ({
      category: 'Frequent',
      title: r.title,
      subtitle: r.path,
      action: { type: 'open', path: r.path },
      icon: '⭐',
      kind: r.category,
      modified: r.lastUsed,
    }));
  });

  ipcMain.handle('record-selection', async (_event, data) => {
    tracker.record(data.query, data.resultPath, data.category, data.title);
  });

  ipcMain.handle('resize-window', (_event, height: number) => {
    const win = getWindow();
    if (!win) return;
    const cfg = config.get();
    const { screen } = require('electron');
    const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const maxHeight = Math.floor(screenHeight * 0.85);
    const clampedHeight = Math.min(Math.max(height, 52), maxHeight);
    const bounds = win.getBounds();
    win.setBounds({ x: bounds.x, y: bounds.y, width: cfg.windowWidth, height: clampedHeight });
  });

  ipcMain.handle('preview-file', async (_event, filePath: string) => {
    try {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const name = path.basename(filePath);
      const size = formatSize(stat.size);
      const modified = stat.mtime.toLocaleDateString();

      const isImage = IMAGE_EXTENSIONS.has(ext);
      const isText = TEXT_EXTENSIONS.has(ext) || (stat.size < 500 * 1024 && !isImage);

      if (isImage) {
        const mimeMap: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.bmp': 'image/bmp',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.tiff': 'image/tiff',
          '.tif': 'image/tiff',
        };
        const mime = mimeMap[ext] ?? 'image/png';
        const data = fs.readFileSync(filePath);
        const imageData = `data:${mime};base64,${data.toString('base64')}`;
        return { name, path: filePath, size, modified, isImage: true, isText: false, content: null, imageData };
      }

      if (isText && stat.size < 500 * 1024) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const lines = raw.split('\n').slice(0, 500).join('\n');
        return { name, path: filePath, size, modified, isImage: false, isText: true, content: lines, imageData: null };
      }

      return { name, path: filePath, size, modified, isImage: false, isText: false, content: null, imageData: null };
    } catch {
      return null;
    }
  });
}
