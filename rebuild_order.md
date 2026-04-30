# HistoriDoc App - Rebuild Order Guide

This document outlines the recommended order for rebuilding the app from scratch, including which files must be developed together and the logical progression of implementation.

---

## Phase 1: Project Foundation & Configuration

### 1. **package.json**

Start here to define your dependencies and scripts.

**Key dependencies to install:**

```bash
npm init -y
npm install electron react react-dom simple-git
npm install -D @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-webpack typescript @types/react @types/react-dom ts-loader css-loader style-loader
```

### 2. **tsconfig.json**

Configure TypeScript compiler options before writing any TypeScript code.

### 3. **.eslintrc.json** (Optional)

Set up linting rules early to maintain code quality from the start.

---

## Phase 2: Type Definitions

### 4. **src/types.ts**

**Write this FIRST before any implementation files.**

Define all TypeScript interfaces that will be used throughout the app:

**Order of type definitions:**

1. `Version` interface (used by version history)
2. `ApiResult` interface (used by all IPC handlers)
3. `ElectronAPI` interface (defines the contract between main and renderer)

**Why first?** Both main process and renderer depend on these types. Having them defined upfront prevents refactoring later.

---

## Phase 3: Webpack & Build Configuration

### 5. **webpack.rules.ts**

Define how to process TypeScript, CSS, and other files.

### 6. **webpack.plugins.ts**

Configure webpack plugins for development.

### 7. **webpack.main.config.ts**

Configure bundling for the main process.

### 8. **webpack.renderer.config.ts**

Configure bundling for the renderer process.

### 9. **forge.config.ts**

Configure Electron Forge with webpack plugins and makers.

**Note:** You can write these in any order, but complete all before trying to run the app.

---

## Phase 4: Main Process (Backend)

### 10. **src/index.ts** (Main Process)

This is the heart of your application. Build it in this order:

#### Step 1: Basic Electron Window Setup

```typescript
import { app, BrowserWindow } from 'electron';

// 1. Create window function
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

// 2. App lifecycle handlers
app.on('ready', createWindow);
app.on('window-all-closed', () => { ... });
app.on('activate', () => { ... });
```

#### Step 2: Helper Functions (Build These First)

Write utility functions before IPC handlers that use them:

1. **`getTrackedFilesPath()`** - Returns path to tracked.json
2. **`getPreferencesPath()`** - Returns path to preferences.json
3. **`loadTrackedFiles()`** - Reads tracked.json
4. **`saveTrackedFiles()`** - Writes to tracked.json
5. **`loadPreferences()`** - Reads preferences.json
6. **`savePreferences()`** - Writes to preferences.json
7. **`getFileRepoPath(filePath)`** - Converts file path to repo directory path
8. **`ensureDirectoryExists(dirPath)`** - Creates directory if needed

#### Step 3: IPC Handlers (Build in This Order)

**Group 1: File Management (Core Functionality)**

1. **`select-file`** - File picker dialog (simplest, no Git)
2. **`track-file`** - Initialize Git repo for a file
   - Uses: `getFileRepoPath()`, `ensureDirectoryExists()`, `loadTrackedFiles()`, `saveTrackedFiles()`
3. **`get-tracked-files`** - Return list of tracked files
   - Uses: `loadTrackedFiles()`
4. **`remove-tracked-file`** - Remove file from tracking
   - Uses: `loadTrackedFiles()`, `saveTrackedFiles()`

**Group 2: Version Control (Git Operations)** 5. **`check-file-changes`** - Check if file has changes

- Uses: `getFileRepoPath()`, simple-git

6. **`commit-version`** - Save new version
   - Uses: `getFileRepoPath()`, simple-git
7. **`get-versions`** - Fetch version history
   - Uses: `getFileRepoPath()`, simple-git
8. **`restore-version`** - Restore to previous version
   - Uses: `getFileRepoPath()`, simple-git
9. **`rename-last-version`** - Rename last commit
   - Uses: `getFileRepoPath()`, simple-git
10. **`export-version`** - Export version to file
    - Uses: `getFileRepoPath()`, simple-git, dialog

**Group 3: Preferences (Simple Storage)** 11. **`get-preference`** - Get preference value - Uses: `loadPreferences()` 12. **`set-preference`** - Set preference value - Uses: `loadPreferences()`, `savePreferences()`

**Why this order?**

- Build from simple to complex
- File management before Git operations
- Each handler builds on previously written helpers

---

## Phase 5: Preload Script (IPC Bridge)

### 11. **src/preload.ts**

**Must be written AFTER main process IPC handlers are defined.**

Expose IPC methods to renderer via `contextBridge`:

**Order:**

1. Import `contextBridge` and `ipcRenderer`
2. Define API object matching `ElectronAPI` interface from types.ts
3. Expose API via `contextBridge.exposeInMainWorld('electron', api)`

**Why after main process?** You need to know which IPC channels exist before exposing them.

---

## Phase 6: HTML Entry Point

### 12. **src/index.html**

Simple HTML shell. Can be written anytime, but needed before renderer.

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Version Tracker</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

## Phase 7: Renderer Process (Frontend/React)

### 13. **src/index.css**

Global styles. Write this before or alongside React components.

---

## Phase 8: React Components

**Build components from bottom-up (leaf components first, then containers).**

### 14. **src/components/ConfirmDialog.tsx** + **ConfirmDialog.css**

**Start with this - it's the simplest, standalone component.**

**Implementation order:**

1. Define props interface
2. Basic JSX structure
3. Event handlers (`onCancel`, `onConfirm`)
4. Checkbox state for "Don't ask again"
5. Style with CSS

**Why first?**

- No dependencies on other components
- Doesn't use any IPC calls
- Pure UI component

---

### 15. **src/components/FileList.tsx** + **FileList.css**

**Second component - simple display component.**

**Implementation order:**

1. Define props interface (`files: string[]`, `selectedFile`, `onSelectFile`)
2. State for path expansion (`expandedPaths`)
3. Helper functions:
   - `getFileName(filePath)` - Extract filename from path
   - `togglePathExpansion(filePath)` - Toggle expansion state
   - `copyPathToClipboard(filePath)` - Copy to clipboard
4. JSX structure with map over files
5. Style with CSS

**Why second?**

- No IPC calls (just receives data via props)
- Simple state management
- No dependencies on other custom components

---

### 16. **src/components/VersionHistory.tsx** + **VersionHistory.css**

**Third component - most complex, uses IPC extensively.**

**Implementation order:**

**Step 1: Props and Basic State**

```typescript
interface VersionHistoryProps {
  filePath: string | null;
}

// State hooks
const [versions, setVersions] = useState<Version[]>([]);
const [commitMessage, setCommitMessage] = useState("");
const [loading, setLoading] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showRenameDialog, setShowRenameDialog] = useState(false);
const [renameMessage, setRenameMessage] = useState("");
const [copiedHash, setCopiedHash] = useState<string | null>(null);
```

**Step 2: Data Loading Effect**

```typescript
useEffect(() => {
  if (filePath) {
    loadVersions();
  }
}, [filePath]);

async function loadVersions() {
  const versionList = await window.electron.getVersions(filePath);
  setVersions(versionList);
}
```

**Step 3: Handler Functions (Build in Order)**

1. **`handleCommit()`** - Save new version
   - Check for changes first
   - If no changes, offer rename instead
   - Otherwise commit
2. **`handleRestore(hash)`** - Restore version
   - Call IPC, reload versions
3. **`handleExport(hash, message)`** - Export version
   - Call IPC, get file path
4. **`handleDelete()`** - Delete tracked file
   - Confirm, call IPC, notify parent
5. **`handleRenameConfirm()`** - Rename last version
   - Call IPC, reload versions
6. **`copyHashToClipboard(hash)`** - Copy hash
   - Clipboard API, show feedback

**Step 4: JSX Structure**

1. Empty state (no file selected)
2. Commit section (message input + button)
3. Versions list with map
4. Rename dialog (conditional render)
5. Delete confirmation (conditional render)

**Step 5: Styling**
Add CSS for layout, buttons, version cards, dialogs

**Why third?**

- Most complex component
- Uses most IPC calls
- Needs understanding of Git operations
- Builds on patterns from simpler components

---

### 17. **src/components/App.tsx** + **App.css**

**Fourth (last) component - root container that ties everything together.**

**Implementation order:**

**Step 1: State Setup**

```typescript
const [trackedFiles, setTrackedFiles] = useState<string[]>([]);
const [selectedFile, setSelectedFile] = useState<string | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [pendingFilePath, setPendingFilePath] = useState<string | null>(null);
```

**Step 2: Load Data on Mount**

```typescript
useEffect(() => {
  loadTrackedFiles();
}, []);

async function loadTrackedFiles() {
  const files = await window.electron.getTrackedFiles();
  setTrackedFiles(files);
  if (files.length > 0 && !selectedFile) {
    setSelectedFile(files[0]);
  }
}
```

**Step 3: File Management Functions**

1. **`handleAddFile()`** - Open file picker and track
2. **`trackFile(filePath)`** - Track file via IPC

**Step 4: Drag-and-Drop Handlers**

1. **`handleDragOver(e)`** - Prevent default, set dragging state
2. **`handleDragLeave()`** - Clear dragging state
3. **`handleDrop(e)`** - Extract file, show confirm or auto-track

**Step 5: Dialog Handlers**

1. **`handleConfirm(dontAskAgain)`** - Confirm tracking, save preference
2. **`handleCancel()`** - Cancel tracking

**Step 6: File Removal Handler**

1. **`handleFileRemoved(filePath)`** - Remove from list, update selection

**Step 7: JSX Structure**

```tsx
<div className="app" onDragOver={...} onDrop={...} onDragLeave={...}>
  <div className="sidebar">
    <button onClick={handleAddFile}>+ Add File</button>
    <FileList files={trackedFiles} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
  </div>

  <div className="main-content">
    <VersionHistory filePath={selectedFile} onFileRemoved={handleFileRemoved} />
  </div>

  {isDragging && <div className="drag-overlay">Drop file to track</div>}

  {showConfirmDialog && (
    <ConfirmDialog
      filePath={pendingFilePath}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )}
</div>
```

**Step 8: Styling**
Layout with sidebar + main content, drag overlay styles

**Why last?**

- Depends on all other components
- Orchestrates entire app
- Needs all child components to be complete

---

### 18. **src/renderer.tsx**

**Write this LAST in React phase.**

Simple bootstrap code:

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
```

**Why last?** All components must exist before importing App.

---

## Summary: Complete Build Order

### Sequential Order (No Parallelization Needed)

1. **package.json** - Install dependencies
2. **tsconfig.json** - TypeScript config
3. **src/types.ts** - Type definitions
4. **webpack.rules.ts** - Webpack rules
5. **webpack.plugins.ts** - Webpack plugins
6. **webpack.main.config.ts** - Main process webpack config
7. **webpack.renderer.config.ts** - Renderer webpack config
8. **forge.config.ts** - Electron Forge config
9. **src/index.ts** - Main process (build helpers first, then IPC handlers in groups)
10. **src/preload.ts** - IPC bridge
11. **src/index.html** - HTML shell
12. **src/index.css** - Global styles
13. **src/components/ConfirmDialog.tsx** + **ConfirmDialog.css**
14. **src/components/FileList.tsx** + **FileList.css**
15. **src/components/VersionHistory.tsx** + **VersionHistory.css**
16. **src/components/App.tsx** + **App.css**
17. **src/renderer.tsx** - React bootstrap

---

## Files That Must Be Developed Together

### Pair 1: Component + CSS

Always develop these together:

- **ConfirmDialog.tsx** ↔ **ConfirmDialog.css**
- **FileList.tsx** ↔ **FileList.css**
- **VersionHistory.tsx** ↔ **VersionHistory.css**
- **App.tsx** ↔ **App.css**

**Strategy:** Write component structure, then style incrementally as you add features.

### Pair 2: Main Process + Preload

- **src/index.ts** (IPC handlers) ↔ **src/preload.ts** (IPC exposure)

**Strategy:**

1. Write all IPC handlers in `index.ts`
2. Then write `preload.ts` to expose them

### Pair 3: Types + Everything

- **src/types.ts** is referenced by both main and renderer

**Strategy:** Write types first, but you may need to come back and add types as you discover new needs.

---

## Testing Milestones

After completing each phase, you can test:

1. **After Phase 4 (Main Process):** Run `npm start` - window should open (blank)
2. **After Phase 5 (Preload):** Check `window.electron` exists in dev console
3. **After Phase 8 (Components):** Full app should be functional

---

## Pro Tips

### 1. Incremental Development

Don't try to build everything perfectly. Build the skeleton first:

- Get window opening
- Get basic UI rendering
- Add one IPC handler at a time
- Add features incrementally

### 2. Start Simple

For first iteration:

- Skip error handling
- Skip loading states
- Skip confirmation dialogs
- Just get core tracking + version listing working

Then add polish:

- Add loading states
- Add error messages
- Add confirmations
- Add rename/export features

### 3. Use TypeScript Errors as Guide

If you write types.ts first, TypeScript will tell you what's missing as you build.

### 4. Test IPC Early

After writing `track-file` handler and exposing it in preload, test it immediately from a simple button in App.tsx before building the full UI.

---

## Common Pitfalls to Avoid

1. **Don't write renderer before main process** - You'll have no backend to call
2. **Don't skip types.ts** - You'll end up refactoring everything later
3. **Don't build App.tsx before child components** - Build bottom-up
4. **Don't forget webpack config** - App won't run without proper bundling
5. **Don't write complex features first** - Start with "add file" and "list files", then add versioning

---

## Recommended Daily Progress

**Day 1:** Phases 1-3 (Setup + Types)
**Day 2:** Phase 4 (Main Process) - Get window opening, basic IPC
**Day 3:** Phase 5-7 (Preload, HTML, CSS)
**Day 4:** Phase 8 - Components (ConfirmDialog + FileList)
**Day 5:** Phase 8 - Components (VersionHistory + App)
**Day 6:** Polish, bug fixes, testing

---

## Final Checklist

Before considering the app "complete":

- [ ] Window opens and loads React app
- [ ] Can add files via file picker
- [ ] Can drag-and-drop files
- [ ] Files appear in sidebar
- [ ] Can select file and see empty version history
- [ ] Can save first version
- [ ] Can save subsequent versions
- [ ] Can restore previous version
- [ ] Can export version to file
- [ ] Can rename last version (when no changes)
- [ ] Can delete tracked file
- [ ] All IPC calls handle errors gracefully
- [ ] Loading states shown during async operations
- [ ] CSS looks reasonable
- [ ] No console errors
