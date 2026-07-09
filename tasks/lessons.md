# Lessons

## Don't launch/run the app to test changes
The user tested manually and was interrupted twice by attempts to launch the app (electron-forge start, Playwright/Electron driver) for verification. They test the app themselves.
Rule: never run `npm start`, `electron-forge start`, or drive the app via Playwright/Electron unless explicitly asked. Verify changes with lint/typecheck only. This is codified in CLAUDE.md under "When Making Changes".
