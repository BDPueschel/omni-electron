import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { ConfigManager } from './config';
import { registerIpcHandlers } from './ipc';
import { ProviderRegistry } from './providers';

let mainWindow: BrowserWindow | null = null;
let config: ConfigManager;

function createWindow() {
  const cfg = config.get();

  mainWindow = new BrowserWindow({
    width: cfg.windowWidth,
    height: 52,
    frame: false,
    transparent: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });
}

function centerWindow() {
  if (!mainWindow) return;
  const { screen } = require('electron');
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const bounds = mainWindow.getBounds();
  const x = Math.round((screenWidth - bounds.width) / 2);
  mainWindow.setPosition(x, 80);
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    centerWindow();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('window-shown');
  }
}

function registerHotkey() {
  const cfg = config.get();
  globalShortcut.unregisterAll();
  globalShortcut.register(cfg.hotkey, toggleWindow);
}

app.whenReady().then(() => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  config = new ConfigManager(configPath);
  const registry = new ProviderRegistry();
  registry.updateConfig(config.get());
  registerIpcHandlers(config, registry, () => mainWindow);
  createWindow();
  registerHotkey();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
