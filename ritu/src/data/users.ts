import { doc, getDocFromCache, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type Locale = 'en' | 'hi';

export interface UserDoc {
  name: string;
  locale: Locale;
  tz: string;
  webPushTokens: string[];
  createdAt: Timestamp;
}

export const userRef = (uid: string) => doc(db, 'users', uid);

export const deviceTz = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

/** Creates users/{uid} once. Works offline: the write is queued in the local cache. */
export async function ensureUserDoc(uid: string, locale: Locale): Promise<void> {
  try {
    const cached = await getDocFromCache(userRef(uid));
    if (cached.exists()) return;
  } catch {
    // not in cache yet: fall through and create it
  }
  // merge keeps any fields already on the server (e.g. a second device)
  void setDoc(userRef(uid), {
    name: '', locale, tz: deviceTz(), webPushTokens: [], createdAt: serverTimestamp(),
  }, { merge: true });
}
