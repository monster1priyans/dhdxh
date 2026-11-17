# Ritu

Multi-profile period tracker for India, English + हिंदी.

**Everything stays on the phone.** No account, no login, no server, no internet needed. Each person just adds her name and details. Data is stored on the device (IndexedDB inside the app) and only leaves it when she exports a file or a doctor report herself.

## What's in it

- **Profiles:** several people on one phone (mother + daughters), each with her own bangle colour and an optional 4-digit PIN. "Someone I care for" profiles are for a parent tracking a child: fertile days default off, private notes are hidden.
- **PIN:** PBKDF2-SHA256 (150,000 iterations, random salt), stored on the device only. After 5 wrong tries she waits 30 s, doubling each time. Profiles re-lock after 60 s in the background. "Forgot PIN" removes the PIN after 24 hours unless the right PIN is entered. A locked profile shows only a name and a lock: on Home, in the calendar, in reminders.
- **Home:** one row per profile with a small bangle, a status line ("Day 12, period in 16 days") and a "Period started / Period ended" button.
- **Profile page:** the big bangle (period arc, fertile arc, ovulation bead, today bead), quick-log chips, the next 3 periods with their range and confidence, and banners for doctor flags or a period that hasn't been ended.
- **Log sheet:** the period on/off rules from the spec, flow, symptoms, mood, pain, notes, TTC fields (temperature, LH test) and a private section.
- **Calendar:** month grid with swipe, a legend, "This profile / Everyone" views, and an info sheet for future days.
- **Insights:** stats, cycle and period-length charts, symptom heatmap, health flags with explanations, and a doctor report (PDF).
- **Period history:** every period with its length and cycle strip; edit, add or delete with clear errors (future dates, reversed dates, overlaps). Changes to periods can be undone from the toast.
- **More to log:** discharge, birth-control pill (optional per profile, with a quick "Taken / Missed" row), sleep, water and weight, with range checks. New symptoms (constipation, hot flashes, joint pain) and mood (stressed).
- **Trying to conceive:** a "Fertility today" card (peak / high / lower), LH-test and temperature-rise notes (3-over-6 rule) and a morning-temperature chart.
- **Pregnancy:** due date (typed in, or from the last period), week + days, trimester, progress and a general guide to common check-ups. "Pregnancy ended" asks how it ended: a birth, a loss, or "Pregnant" chosen by mistake.
- **Life stages:**
  - *Before the first period* (set in onboarding or profile settings): no predictions; signs the first period may come soon, a period kit for school, how to talk about periods, and when to see a doctor. "First period started" begins tracking.
  - *After a birth or a pregnancy loss:* time since the birth, postnatal check-ups, warning signs that need a doctor at once, when periods come back, and support (Tele-MANAS 14416). Bleeding in the first 6 weeks after a birth is checked before it counts as a period. Predictions and doctor warnings restart from the first period after the pregnancy, so Ritu never calls her "250 days late"; the engine itself is unchanged and older periods stay in the history and charts.
- **Tips and coming up:** one general tip per day for her phase or trimester; Home shows the next 2 weeks (periods, fertile days, due dates) for every unlocked profile.
- **More insights:** how regular the cycles are, the usual 21–35 day band, most common symptoms, mood by phase, sleep/water/pill habits, weight and temperature charts.
- **Reminders (Android app):** local notifications that fire offline. They are discreet by default, and always discreet for PIN profiles.
- **Export and backup:** CSV + JSON per profile. The whole-phone backup file can be restored on a new phone.
- **Modes, language and theme:** Track / Trying to conceive / Pregnant (predictions paused). Hindi, dark mode, 360 px screens and large fonts are supported.

The prediction engine (`shared/engine.ts`) is used exactly as specified, and its golden tests pass under `Asia/Kolkata` and `America/Los_Angeles`.

## Commands

```bash
npm install
npm run dev            # web dev server
npm run typecheck      # TypeScript strict
npm run test:tz        # all unit tests under Asia/Kolkata and America/Los_Angeles
npm run build          # production web build (installable PWA, works offline)
npm run preview        # serve the build on http://localhost:4173
npm run e2e            # end-to-end smoke test against `npm run preview`
npm run i18n           # regenerate src/i18n/en.json + hi.json from scripts/i18n-data.py
```

Edit strings in `scripts/i18n-data.py`, not in the JSON files. The script refuses to write if English and Hindi keys differ.

## Checks on GitHub

Every push that touches `ritu/` runs `.github/workflows/ritu.yml`: typecheck, unit tests in both time zones, the production build, the end-to-end browser test, and a debug APK build. Open the run under **Actions → Ritu** to download `ritu-debug-apk` (install it on an Android phone to try a change) and `ritu-screenshots`.

## Android app

You need Android Studio (or the Android SDK + JDK 21).

```bash
npm run android                   # web build + copy into android/
npx cap open android              # open in Android Studio, then Run
```

Debug APK from the command line:

```bash
cd android && ./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Before release:

1. Change the app ID `com.yourname.ritu` in `capacitor.config.ts` **and** `android/app/build.gradle` (`applicationId`, `namespace`), and move the `MainActivity.java` package folder to match.
2. Bump `versionCode` / `versionName` in `android/app/build.gradle` for every upload.
3. Create an upload key once and keep it safe (losing it means you can't update the app):
   ```bash
   keytool -genkey -v -keystore ritu-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ritu
   ```
4. Build the signed bundle for Play:
   ```bash
   npm run android
   cd android && ./gradlew bundleRelease \
     -Pandroid.injected.signing.store.file=$PWD/../ritu-upload.jks \
     -Pandroid.injected.signing.store.password=*** \
     -Pandroid.injected.signing.key.alias=ritu \
     -Pandroid.injected.signing.key.password=***
   # app/build/outputs/bundle/release/app-release.aab
   ```

Android privacy settings already applied:

- `allowBackup="false"` plus `data_extraction_rules.xml`, so her data is never copied to Google Drive or to another device.
- A plain bangle notification icon (`ic_stat_ritu`).

Play Store listing text (English + Hindi) and the Data safety answers are in [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md).

## Notes

- **Uninstalling deletes everything.** Uninstalling the app or clearing its data removes all profiles. Settings → Backup → "Save backup" is the way to keep a copy or move to a new phone. Home shows a gentle reminder when there has been no backup for 30 days, and Settings → "Erase everything" wipes the phone clean.
- **Web reminders:** the web version can't fire reminders when closed; reminders need the Android app.
- **No tracking code:** there are no analytics, ads, crash reporting or third-party SDKs, and health data is never logged.
