# Ritu

Multi-profile period tracker for India, English + हिंदी. Built from the build spec, milestone by milestone.

## Commands

```bash
npm install
npm run dev            # web dev server
npm run typecheck      # TypeScript strict
npm run test:tz        # engine golden tests under Asia/Kolkata and America/Los_Angeles
npm run build          # production web build (PWA service worker included)
```

### Local emulators (no real Firebase project needed)

Needs Java 21+.

```bash
npx firebase emulators:start --only auth,firestore --project demo-ritu   # terminal 1
npx vite --mode emulator                                                 # terminal 2 (uses .env.emulator)
```

Create `.env.emulator` containing `VITE_USE_EMULATORS=true`. Release builds never contain the emulator code.

## One-time setup (by hand)

1. Create a Firebase project. Create Firestore in **asia-south1** (Mumbai); the location can't be changed later.
2. Authentication → Sign-in method: enable **Anonymous** and **Google**.
3. Add a **Web app**, then copy `.env.example` to `.env` and fill in its config values.
4. Add an **Android app** with package `com.yourname.ritu` (change it in `capacitor.config.ts` first if you want a different ID), plus your debug and release SHA-1 fingerprints. Download `google-services.json` (it goes in `android/app/` in M4).
5. Deploy the rules and indexes:
   ```bash
   npx firebase login
   npx firebase use --add          # pick the project
   npm run deploy:rules
   ```
6. Phase 2: upgrade to the Blaze plan (Cloud Functions need it) and create a Web Push VAPID key (Project settings → Cloud Messaging), then put it in `VITE_FIREBASE_VAPID_KEY`.
