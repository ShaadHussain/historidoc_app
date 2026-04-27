# Features

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
