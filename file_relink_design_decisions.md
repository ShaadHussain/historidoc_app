# File Re-link Design Decisions

## Move Detection

- Use `chokidar` to watch all tracked file paths on app startup
- On `unlink` event, immediately prompt the user to re-link rather than waiting for next app open
- Do not attempt to distinguish between a move and a deletion prompt in both cases. If the file was deleted, the user dismisses the dialog. If it was moved, they re-link it.
- Provide a "don't ask again" option on the prompt for users who frequently delete tracked files

## Re-link Action

- On re-link, rename the repo directory from `hash(oldPath)` to `hash(newPath)` on disk
- Update `tracked.json` to replace the old path with the new path
- No git files are affected git is unaware of the containing directory name

## Filename Mismatch Warning

- CHANGE*NOTE: When the user tries to relink to a new file, it doesn't matter whether the name differs or not, show them the warning below
  *"Ensure the file you are relinking to is the same file that was being tracked. Linking these will attach <old*file's>s entire version history to this file. This could corrupt your history if this isn't the same file in a new location."*

## Content Preview

- Before confirming a re-link, show the user a snippet of the last saved version
- Makes any mismatch immediately obvious without relying on the user reading a warning

## Start Fresh Option

- Alongside the re-link confirmation, offer a "Start fresh" option
- This tracks the new file with a clean history, leaving the old history unattached
- Prevents the user from having to cancel, find the old entry, and untrack it manually

## OS Limit Degradation

# CHANGE_NOTE: Let's leave this for later. I don't want to implement this now

- Wrap watcher setup in a single try/catch
- If the OS limit is hit (`ENOSPC` on Linux), show a one-time notification:
  _"Some files can't be monitored if they move directories due to OS limits you'll need to re-link them manually if they move."_
- App continues to function normally; affected files just lose automatic move detection
