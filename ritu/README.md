# Ritu

Multi-profile period tracker for India, English + हिंदी.

**Everything stays on the phone.** No account, no login, no server, no internet needed. Each person just adds her name and details. Data is stored on the device (IndexedDB) and only leaves it when she exports it herself.

## Commands

```bash
npm install
npm run dev            # web dev server
npm run typecheck      # TypeScript strict
npm run test:tz        # engine + data tests under Asia/Kolkata and America/Los_Angeles
npm run build          # production web build (works offline via the service worker)
```

## Notes

- Uninstalling the app or clearing its data deletes everything. Export (Settings) is the backup.
- Android app setup (Capacitor) arrives in M4.
