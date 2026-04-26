# Features

## FEAT_101
Handle no-commits case explicitly in check-file-changes
- Replace broad try/catch with an explicit `rev-parse HEAD` check
- No-commits path is now a normal conditional branch, not a swallowed exception

## FEAT_100
Add copy button to version hash with checkmark feedback
- Clicking the copy button (📋 icon) copies the full git commit hash to clipboard
- Button changes to checkmark (✓) for 2 seconds after copying
- Provides visual feedback that the hash was successfully copied
