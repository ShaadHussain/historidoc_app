# File Re-link Design Decisions

## Move Detection
- Use `chokidar` to watch all tracked file paths on app startup
- On `unlink` event, immediately prompt the user to re-link rather than waiting for next app open
- Do not attempt to distinguish between a move and a deletion — prompt in both cases. If the file was deleted, the user dismisses the dialog. If it was moved, they re-link it.
- Provide a "don't ask again" option on the prompt for users who frequently delete tracked files

## Re-link Action
- On re-link, rename the repo directory from `hash(oldPath)` to `hash(newPath)` on disk
- Update `tracked.json` to replace the old path with the new path
- No git files are affected — git is unaware of the containing directory name

## Filename Mismatch Warning
- When the user picks a new location, compare the new filename to the original
- If they differ, show an explicit warning before confirming:
  *"The file you selected ('budget.xlsx') has a different name than the original ('essay.txt'). Linking these will attach essay.txt's entire version history to this file. This could corrupt your history if this isn't the same file in a new location."*
- If filenames match, proceed silently

## Content Preview
- Before confirming a re-link, show the user a snippet of the last saved version
- Makes any mismatch immediately obvious without relying on the user reading a warning

## Start Fresh Option
- Alongside the re-link confirmation, offer a "Start fresh" option
- This tracks the new file with a clean history, leaving the old history unattached
- Prevents the user from having to cancel, find the old entry, and untrack it manually

## OS Limit Degradation
- Wrap watcher setup in a single try/catch
- If the OS limit is hit (`ENOSPC` on Linux), show a one-time notification:
  *"Some files can't be monitored for moves due to OS limits — you'll need to re-link them manually if they move."*
- App continues to function normally; affected files just lose automatic move detection
