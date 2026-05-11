import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  selectFile: () => ipcRenderer.invoke("select-file"),
  trackFile: (filePath: string) => ipcRenderer.invoke("track-file", filePath),
  getTrackedFiles: () => ipcRenderer.invoke("get-tracked-files"),
  checkFileChanges: (filePath: string) =>
    ipcRenderer.invoke("check-file-changes", filePath),
  commitVersion: (filePath: string, message: string) =>
    ipcRenderer.invoke("commit-version", filePath, message),
  renameLastVersion: (filePath: string, newMessage: string) =>
    ipcRenderer.invoke("rename-last-version", filePath, newMessage),
  getVersions: (filePath: string) =>
    ipcRenderer.invoke("get-versions", filePath),
  restoreVersion: (filePath: string, commitHash: string) =>
    ipcRenderer.invoke("restore-version", filePath, commitHash),
  removeTrackedFile: (filePath: string) =>
    ipcRenderer.invoke("remove-tracked-file", filePath),
  deleteFileHistory: (filePath: string) =>
    ipcRenderer.invoke("delete-file-history", filePath),
  exportVersion: (
    filePath: string,
    commitHash: string,
    versionMessage: string,
  ) =>
    ipcRenderer.invoke("export-version", filePath, commitHash, versionMessage),
  getDiff: (filePath: string, commitHash: string) =>
    ipcRenderer.invoke("get-diff", filePath, commitHash),
  onFileMissing: (callback: (filePath: string) => void) =>
    ipcRenderer.on("file-missing", (_, filePath) => callback(filePath)),
  checkMissingFiles: (filePaths: string[]) =>
    ipcRenderer.invoke("check-missing-files", filePaths),
  relinkFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke("relink-file", oldPath, newPath),
  startFresh: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke("start-fresh", oldPath, newPath),
  getLastVersionContent: (filePath: string) =>
    ipcRenderer.invoke("get-last-version-content", filePath),
  getPreference: (key: string) => ipcRenderer.invoke("get-preference", key),
  setPreference: (key: string, value: any) =>
    ipcRenderer.invoke("set-preference", key, value),
  showInFolder: (filePath: string) =>
    ipcRenderer.invoke("show-in-folder", filePath),
  exportVersionHistory: (filePath: string, format: "text" | "markdown" | "csv") =>
    ipcRenderer.invoke("export-version-history", filePath, format),
});
