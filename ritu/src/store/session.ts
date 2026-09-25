import { create } from 'zustand';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';
import { ensureUserDoc } from '../data/users';
import { currentLocale } from '../i18n';

export type SessionStatus = 'loading' | 'needs_network' | 'not_configured' | 'error' | 'ready';

interface SessionState {
  status: SessionStatus;
  uid: string | null;
  isAnonymous: boolean;
  start: () => () => void;
  retry: () => void;
}

const isNetworkError = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'auth/network-request-failed';

async function firstSignIn(set: (s: Partial<SessionState>) => void) {
  // anonymous sign-in needs the internet exactly once; everything after works offline
  if (!navigator.onLine) {
    set({ status: 'needs_network' });
    return;
  }
  try {
    const cred = await signInAnonymously(auth);
    await ensureUserDoc(cred.user.uid, currentLocale());
  } catch (e) {
    set({ status: isNetworkError(e) ? 'needs_network' : 'error' });
  }
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'loading',
  uid: null,
  isAnonymous: true,

  start: () => {
    if (!firebaseConfigured) {
      set({ status: 'not_configured' });
      return () => {};
    }
    // the persisted user (IndexedDB) is restored here even in airplane mode
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        set({ status: 'ready', uid: user.uid, isAnonymous: user.isAnonymous });
      } else {
        set({ uid: null });
        void firstSignIn(set);
      }
    });
    const onOnline = () => { if (get().status === 'needs_network') get().retry(); };
    window.addEventListener('online', onOnline);
    return () => {
      unsub();
      window.removeEventListener('online', onOnline);
    };
  },

  retry: () => {
    set({ status: 'loading' });
    void firstSignIn(set);
  },
}));
