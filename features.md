# Features

## FEAT_109
App-wide settings page
- Gear icon in the main header opens a settings modal
- "File History" section contains the "Always delete old file history after Start Fresh" toggle
- Toggle reads and writes the alwaysDeleteOnStartFresh preference immediately on change

## FEAT_108
Preserve archived history after Start Fresh (default behavior)
- Start Fresh keeps old path as a faded "Archived" entry in the file list by default
- Archived entries are visually dimmed with an "Archived" badge; history is still viewable
- Archived files are excluded from missing-file checks and live-detection toasts
- After Start Fresh, a dialog explains the behavior and offers "Always delete old history" toggle
- "Always delete old file history after Start Fresh" is an app-wide persistent setting
- Untrack and Delete History operations also clean up the deprecated files list

## FEAT_107
Toast notification for live file-missing detection
- A small bottom-right toast always appears when a file disappears while the app is running
- Toast shows filename, an X to dismiss, and a "See details" button to open the RelinkDialog
- "Don't ask again" only suppresses the auto-dialog; the toast always fires
- RelinkDialog now includes a note: if the file was intentionally deleted, users can leave it as is or remove it from File Settings

## FEAT_106
File move detection and re-linking
- chokidar watches all tracked files; fires immediately when a file disappears
- Missing files shown in the file list with orange border, warning icon, and Re-link button
- RelinkDialog shows: corruption warning, last saved version preview, file picker
- Re-link: renames repo directory to new path hash, updates tracked.json
- Start Fresh: orphans old history, starts a clean repo for the new path
- Don't ask again checkbox suppresses auto-dialog for future missing files

## FEAT_105
File settings page with Danger Zone
- Gear icon in version history header opens a settings view
- Untrack: stops tracking but preserves version history (can re-add later)
- Delete All: permanently removes file and all version history

## FEAT_104
Info tooltip next to Add File button explaining folder tracking
- Hovering the ℹ icon shows: "Folders can be tracked too — ideal for whole-project snapshots. For line-by-line change history, track individual files instead."

## FEAT_103
Unify copy button style and fix border clipping on hover
- Replace scale transform with box-shadow glow to fix left border being clipped
- Add checkmark SVG feedback (500ms) to file path copy button
- Replace clipboard emoji in version hash copy button with same styled SVG button

## FEAT_102
Diff viewer — show what changed in each version
- Each version card gets a Diff button
- Opens a modal showing added (green) and removed (red) lines
- Uses git diff-tree under the hood, works for all commits including the first

## FEAT_101
Handle no-commits case explicitly in check-file-changes
- Replace broad try/catch with an explicit `rev-parse HEAD` check
- No-commits path is now a normal conditional branch, not a swallowed exception

## FEAT_100
Add copy button to version hash with checkmark feedback
- Clicking the copy button (📋 icon) copies the full git commit hash to clipboard
- Button changes to checkmark (✓) for 2 seconds after copying
- Provides visual feedback that the hash was successfully copied
