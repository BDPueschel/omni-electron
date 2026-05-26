import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { ConfigManager } from './config';
import { registerIpcHandlers } from './ipc';
import { ProviderRegistry } from './providers';
import { UsageTracker } from './usage';
import { FrequentProvider } from './providers/frequent';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
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

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 500,
    title: 'Omni Settings',
    frame: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173/settings.html');
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../../dist/settings.html'));
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/icon.png');
  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('Omni Launcher');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Omni',
      click: () => toggleWindow(),
    },
    {
      label: 'Settings',
      click: () => createSettingsWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
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
  const tracker = new UsageTracker(path.join(app.getPath('userData'), 'usage.db'));
  const registry = new ProviderRegistry();
  registry.updateConfig(config.get());
  registry.addProvider(new FrequentProvider(tracker));
  registry.getClipboardProvider()?.startWatching();
  registerIpcHandlers(config, registry, tracker, () => mainWindow);
  createWindow();
  registerHotkey();
  createTray();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
