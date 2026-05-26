import { ipcMain, BrowserWindow } from 'electron';
import { ConfigManager } from './config';

export function registerIpcHandlers(config: ConfigManager, getWindow: () => BrowserWindow | null) {
  ipcMain.handle('get-config', () => {
    return config.get();
  });

  ipcMain.handle('save-config', (_event, newConfig) => {
    config.save(newConfig);
    const win = getWindow();
    if (win) {
      win.setSize(newConfig.windowWidth, win.getBounds().height);
    }
  });

  ipcMain.handle('hide-window', () => {
    const win = getWindow();
    win?.hide();
  });

  ipcMain.handle('search', async (_event, _query: string) => {
    return [];
  });

  ipcMain.handle('execute-action', async (_event, _action) => {
    // Implemented in Task 5
  });

  ipcMain.handle('expand-category', async (_event, _query: string, _category: string) => {
    return [];
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
