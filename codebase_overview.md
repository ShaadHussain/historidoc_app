# HistoriDoc App - Codebase Overview

## What It Is

HistoriDoc is a desktop application built with **Electron + React + TypeScript** that tracks version history of individual files using Git under the hood. Users can save, restore, and export different versions of any file without needing to understand Git.

## Technology Stack

- **Electron 41.2.1** - Desktop application framework
- **React 19.2.5** - UI framework
- **TypeScript** - Type-safe development
- **simple-git** - Git operations wrapper
- **Webpack** - Module bundling (via Electron Forge)

---

## Entry Points

### 1. HTML Entry (`/src/index.html`)
Simple HTML shell with a `root` div where React mounts.

### 2. Main Process (`/src/index.ts`)
The Electron main process that:
- Creates and manages the application window
- Handles all IPC communication between UI and backend
- Manages file system operations and Git repositories
- Stores tracked files and preferences

### 3. Renderer Process (`/src/renderer.tsx`)
Initializes the React application and mounts it to the DOM.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│        Electron Main Process                │
│         (/src/index.ts)                     │
│  - Window Management                        │
│  - 11 IPC Handlers                          │
│  - Git Repository Management                │
│  - File System Operations                   │
└──────────────────┬──────────────────────────┘
                   │ IPC Bridge
                   │ (/src/preload.ts)
                   ↓
┌─────────────────────────────────────────────┐
│        React UI (Renderer)                  │
│  - App.tsx                                  │
│  - FileList.tsx                             │
│  - VersionHistory.tsx                       │
│  - ConfirmDialog.tsx                        │
└─────────────────────────────────────────────┘
```

---

## Component Structure

```
App (Root Component)
├── FileList
│   └── Shows all tracked files
│       - Expandable file paths
│       - Copy path to clipboard
│
├── VersionHistory
│   └── Main version management panel
│       - Save new versions
│       - View version history
│       - Restore previous versions
│       - Export versions to files
│       - Delete/rename versions
│
└── ConfirmDialog
    └── Drag-and-drop confirmation
```

---

## Core Components

### **App.tsx** (Root Component)
- Manages global state (tracked files, selected file)
- Handles file drag-and-drop
- Loads tracked files on mount
- Coordinates between FileList and VersionHistory

### **FileList.tsx** (Left Sidebar)
- Displays all tracked files
- Shows file names with expandable full paths
- Provides "copy path to clipboard" functionality
- Highlights currently selected file

### **VersionHistory.tsx** (Main Panel)
- Shows version history for selected file
- Creates new versions with optional messages
- Restores files to previous versions
- Exports specific versions to new files
- Renames or deletes versions

### **ConfirmDialog.tsx** (Modal)
- Confirms file tracking when user drags files into app
- "Don't ask again" preference option

---

## Data Flow Example: Tracking a File

```
User drops file into app
    ↓
App.handleDrop() captures file path
    ↓
ConfirmDialog shows (unless auto-confirm enabled)
    ↓
User confirms
    ↓
window.electron.trackFile() → IPC call to main process
    ↓
Main process creates Git repo for file
    ↓
File path saved to tracked.json
    ↓
UI refreshes to show new file in FileList
```

---

## Key Features

### 1. **File Tracking**
- Each tracked file gets its own isolated Git repository
- File content is copied to the repo and versioned
- Files remain in their original location

### 2. **Version Management**
- Save versions with custom messages or auto-numbered (V1, V2, etc.)
- View complete version history with dates and messages
- Copy version hash to clipboard

### 3. **Restore & Export**
- **Restore**: Overwrite current file with a previous version
- **Export**: Save a specific version to a new file

### 4. **Drag-and-Drop**
- Drop files directly into the app to start tracking
- Optional confirmation dialog
- "Don't ask again" preference

### 5. **Change Detection**
- Detects if file has changed before saving
- If no changes, offers to rename last version instead

---

## Type Definitions (`/src/types.ts`)

```typescript
interface Version {
  hash: string;      // Git commit hash
  message: string;   // Version label/message
  date: string;      // Commit date
  author: string;    // Author name
}

interface ApiResult {
  success: boolean;  // Operation status
  error?: string;    // Error message if failed
  path?: string;     // File path (for exports)
}

interface ElectronAPI {
  selectFile(): Promise<string | null>;
  trackFile(filePath: string): Promise<ApiResult>;
  getTrackedFiles(): Promise<string[]>;
  commitVersion(filePath: string, message: string): Promise<ApiResult>;
  getVersions(filePath: string): Promise<Version[]>;
  restoreVersion(filePath: string, hash: string): Promise<ApiResult>;
  exportVersion(filePath: string, hash: string, msg: string): Promise<ApiResult>;
  // ... and more
}
```

---

## IPC Handlers (Main Process)

11 IPC handlers bridge the UI and backend:

| Handler | Purpose |
|---------|---------|
| `select-file` | Open file picker dialog |
| `track-file` | Initialize tracking for a file |
| `get-tracked-files` | Fetch list of all tracked files |
| `check-file-changes` | Check if file has unsaved changes |
| `commit-version` | Save a new version |
| `rename-last-version` | Rename most recent version |
| `get-versions` | Get version history for a file |
| `restore-version` | Restore file to previous version |
| `remove-tracked-file` | Stop tracking a file |
| `export-version` | Export version to separate file |
| `get-preference` / `set-preference` | Manage user preferences |

---

## Data Storage

```
{appDataPath}/
├── tracked.json           # List of tracked file paths
├── preferences.json       # User preferences
└── {hashedFilePath}/      # One directory per tracked file
    ├── .git/              # Git repository
    └── {filename}         # Copy of the file
```

- File paths are hashed (base64) to create unique directory names
- Each file gets its own isolated Git repo
- Preferences include: `autoConfirmDrop`

---

## Security (Electron Best Practices)

- **Context Isolation**: Enabled (`contextIsolation: true`)
- **No Node Integration**: Disabled (`nodeIntegration: false`)
- **Preload Script**: Controlled API exposure via `contextBridge`
- **IPC Validation**: All handlers validate input

---

## Directory Structure

```
src/
├── index.html              # HTML entry point
├── index.ts                # Main process (Electron)
├── renderer.tsx            # React initialization
├── preload.ts              # IPC bridge
├── types.ts                # TypeScript definitions
├── index.css               # Global styles
└── components/
    ├── App.tsx             # Root component
    ├── App.css
    ├── FileList.tsx        # File list sidebar
    ├── FileList.css
    ├── VersionHistory.tsx  # Version management panel
    ├── VersionHistory.css
    ├── ConfirmDialog.tsx   # Confirmation dialog
    └── ConfirmDialog.css
```

---

## Build & Development

- **Start**: `npm start` (runs Electron Forge)
- **Package**: `npm run package`
- **Make**: `npm run make` (creates installers)

**Webpack** handles bundling:
- Main process → `.webpack/main`
- Renderer process → React app
- Preload script → Isolated bridge

**Platform Support**:
- Windows (Squirrel installer)
- macOS (ZIP)
- Linux (Deb/RPM)

---

## Summary

A clean, well-structured desktop app that provides Git-powered version control for individual files through an intuitive drag-and-drop interface. The architecture separates concerns clearly between the Electron main process (backend) and React renderer (frontend), communicating via a secure IPC bridge.
