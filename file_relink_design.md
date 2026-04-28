# File Relinking & Move Detection Design

## The Problem

Tracked files are stored by their absolute path in `tracked.json`. The git repo for each file is stored in a directory named after a hash of that absolute path (via `getRepoPath()`). If a user moves a tracked file to a different directory, the app loses the connection to its history — the path in `tracked.json` no longer exists on disk.

---

## Options Considered

### Option 1: Detect and prompt to re-link (chosen)
On startup, check if each tracked path still exists on disk. If not, show it grayed out in the file list with a "File moved — re-link" button. The user picks the new location, and you:
1. Compute the new repo path: `hash(newPath)`
2. Rename the old repo directory to the new hash name
3. Update `tracked.json` with the new path

Full history is preserved. The git repo directory and all its commits are intact — you just moved the folder it lives in. Git doesn't care about the folder name, only what's inside `.git`.

### Option 2: Use file identity (inode)
Store the inode alongside the path and auto-detect moves. Doesn't work across filesystems, unreliable on Windows, significant added complexity.

### Option 3: Tell users to untrack before moving
Poor UX — users won't read docs, and silently losing history is a bad experience.

---

## Immediate Detection via File Watching

Rather than only detecting a missing file when the user next opens the app, we can detect moves immediately using a file watcher and prompt the user right away.

**How it works:**
- On startup, register a watcher for every path in `tracked.json`
- The watcher uses the OS's native push-based APIs (`FSEvents` on macOS, `inotify` on Linux) — zero CPU cost between events
- When a file disappears, send a message from the main process to the renderer via `mainWindow.webContents.send(...)` and show a re-link prompt

**Important:** a move looks like a deletion to the watcher. There is no native "moved to X" event. The user still needs to pick the new location manually.

**Library:** `chokidar` over raw `fs.watch` for cross-platform reliability. Some editors save via a temp-file-then-rename pattern that raw `fs.watch` misses; chokidar handles this.

---

## Scale Considerations

### Up to ~hundreds of files
No concerns. File watchers are push-based — zero CPU until an event fires. Memory cost is a few KB per watcher. This is essentially free.

### At ~10,000 files
The concern is not CPU or memory — it's **OS-level watch handle limits**:
- **macOS**: system-wide limit on FSEvents handles
- **Linux**: `inotify` defaults to 8,192 watches (`fs.inotify.max_user_watches`). 10,000 files exceeds this.

VS Code hits this exact problem with large monorepos. Their solutions:
- Watch directories recursively rather than individual files (one watch covers entire subtree)
- Exclude `node_modules`, `.git`, build dirs via `files.watcherExclude`
- Fall back gracefully with a notification telling the user to raise their inotify limit
- Eventually built a native Rust-based watcher (`vscode-watcher`) for better efficiency

For this app, files are likely scattered across unrelated directories, so recursive directory watching doesn't collapse well. Per-file watching is appropriate at the expected scale.

### Graceful degradation plan
When watcher setup hits the OS limit, `chokidar` throws `ENOSPC` on Linux (confusingly named — means "no inotify watches available", not disk space). 

Handle it with a single try/catch around the watcher setup (not per-file — the OS limit error is thrown for the batch, not per individual file):
1. Catch the error
2. Set a flag
3. Show a one-time notification: *"Some files can't be monitored for moves due to OS limits — you'll need to re-link them manually if they move."*

This ensures the app degrades gracefully: users below the limit get full move detection, users above it are explicitly told why they don't.

---

## Implementation Plan (not yet built)

- Install `chokidar`
- On app startup in `index.ts`, watch all paths from `tracked.json`
- On `unlink` event: notify renderer, show re-link prompt in UI
- Re-link action: rename repo directory + update `tracked.json`
- Wrap watcher init in try/catch, surface OS limit error as notification
