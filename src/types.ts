export interface Version {
  hash: string;
  message: string;
  date: string;
  author: string;
}

export interface ApiResult {
  success: boolean;
  error?: string;
  path?: string;
}

export interface ElectronAPI {
  selectFile: () => Promise<string | null>;
  trackFile: (filePath: string) => Promise<ApiResult>;
  getTrackedFiles: () => Promise<string[]>;
  checkFileChanges: (filePath: string) => Promise<{ hasChanges: boolean; fileMissing?: boolean }>;
  commitVersion: (filePath: string, message: string) => Promise<ApiResult>;
  renameLastVersion: (
    filePath: string,
    newMessage: string,
  ) => Promise<ApiResult>;
  getVersions: (filePath: string) => Promise<Version[]>;
  restoreVersion: (filePath: string, commitHash: string) => Promise<ApiResult>;
  removeTrackedFile: (filePath: string) => Promise<ApiResult>;
  deleteFileHistory: (filePath: string) => Promise<ApiResult>;
  exportVersion: (
    filePath: string,
    commitHash: string,
    versionMessage: string,
  ) => Promise<ApiResult>;
  getDiff: (filePath: string, commitHash: string) => Promise<{ success: boolean; diff: string; error?: string }>;
  onFileMissing: (callback: (filePath: string) => void) => void;
  checkMissingFiles: (filePaths: string[]) => Promise<string[]>;
  relinkFile: (oldPath: string, newPath: string) => Promise<ApiResult>;
  startFresh: (oldPath: string, newPath: string) => Promise<ApiResult>;
  getLastVersionContent: (filePath: string) => Promise<{ success: boolean; content: string }>;
  getPreference: (key: string) => Promise<any>;
  setPreference: (key: string, value: any) => Promise<ApiResult>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
