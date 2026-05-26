import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('omni', {
  search: (query: string) => ipcRenderer.invoke('search', query),
  execute: (action: unknown) => ipcRenderer.invoke('execute-action', action),
  expandCategory: (query: string, category: string) => ipcRenderer.invoke('expand-category', query, category),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: unknown) => ipcRenderer.invoke('save-config', config),
  getFrequent: () => ipcRenderer.invoke('get-frequent'),
  recordSelection: (data: unknown) => ipcRenderer.invoke('record-selection', data),
  previewFile: (filePath: string) => ipcRenderer.invoke('preview-file', filePath),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  resizeWindow: (height: number) => ipcRenderer.invoke('resize-window', height),
  onWindowShown: (callback: () => void) => {
    ipcRenderer.on('window-shown', callback);
    return () => ipcRenderer.removeListener('window-shown', callback);
  },
});
