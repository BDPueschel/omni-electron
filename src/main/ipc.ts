import { ipcMain, BrowserWindow, shell, clipboard } from 'electron';
import { ConfigManager } from './config';
import { ProviderRegistry } from './providers';
import { ResultAction } from '../shared/types';

export function registerIpcHandlers(
  config: ConfigManager,
  registry: ProviderRegistry,
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
    return [];
  });

  ipcMain.handle('record-selection', async (_event, _data) => {
    // Implemented in Task 9
  });

  ipcMain.handle('preview-file', async (_event, _filePath: string) => {
    return null;
  });
}
