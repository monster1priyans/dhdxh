import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  browserPopupRedirectResolver, connectAuthEmulator, indexedDBLocalPersistence, initializeAuth,
  type Dependencies,
} from 'firebase/auth';
import {
  connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { isNative } from './lib/platform';

const env = import.meta.env;

const options: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// only ever set in a local .env.local / .env.emulator, never for a release build
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

/** False when .env is missing its Firebase keys; the app then shows setup help instead of crashing. */
export const firebaseConfigured = Boolean(options.apiKey && options.projectId && options.appId) || useEmulators;

export const app = initializeApp(
  useEmulators ? { ...options, apiKey: options.apiKey || 'demo-key', projectId: options.projectId || 'demo-ritu' } : options,
);

// Never getAuth() and never popups inside Capacitor: both break in the Android WebView.
const authDeps: Dependencies = { persistence: indexedDBLocalPersistence };
if (!isNative()) authDeps.popupRedirectResolver = browserPopupRedirectResolver;
export const auth = initializeAuth(app, authDeps);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if (useEmulators) {
  const host = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}

/** Snapshot read option used everywhere so pending serverTimestamps are never null. */
export const SNAP = { serverTimestamps: 'estimate' } as const;
