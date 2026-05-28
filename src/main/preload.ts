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
  onWindowDismissing: (callback: () => void) => {
    ipcRenderer.on('window-dismissing', callback);
    return () => ipcRenderer.removeListener('window-dismissing', callback);
  },
  completePath: (partial: string) => ipcRenderer.invoke('complete-path', partial),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  addBookmark: (data: { path: string; title: string; category: string; icon: string; kind: string }) => ipcRenderer.invoke('add-bookmark', data),
  removeBookmark: (path: string) => ipcRenderer.invoke('remove-bookmark', path),
  isBookmarked: (path: string) => ipcRenderer.invoke('is-bookmarked', path),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
});
