import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  trackFile: (filePath: string) => ipcRenderer.invoke('track-file', filePath),
  getTrackedFiles: () => ipcRenderer.invoke('get-tracked-files'),
  checkFileChanges: (filePath: string) => ipcRenderer.invoke('check-file-changes', filePath),
  commitVersion: (filePath: string, message: string) => ipcRenderer.invoke('commit-version', filePath, message),
  renameLastVersion: (filePath: string, newMessage: string) => ipcRenderer.invoke('rename-last-version', filePath, newMessage),
  getVersions: (filePath: string) => ipcRenderer.invoke('get-versions', filePath),
  restoreVersion: (filePath: string, commitHash: string) => ipcRenderer.invoke('restore-version', filePath, commitHash),
  removeTrackedFile: (filePath: string) => ipcRenderer.invoke('remove-tracked-file', filePath),
  exportVersion: (filePath: string, commitHash: string, versionMessage: string) => ipcRenderer.invoke('export-version', filePath, commitHash, versionMessage),
  getPreference: (key: string) => ipcRenderer.invoke('get-preference', key),
  setPreference: (key: string, value: any) => ipcRenderer.invoke('set-preference', key, value)
});
