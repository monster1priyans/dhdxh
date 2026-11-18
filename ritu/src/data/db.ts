import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LogRec, PeriodRec, PrivateRec, Profile, ReminderRec } from './types';

// All data lives on this device only. Nothing is ever sent anywhere.
export interface RituDB extends DBSchema {
  profiles: { key: string; value: Profile };
  periods: { key: string; value: PeriodRec; indexes: { pid: string } };
  logs: { key: [string, string]; value: LogRec; indexes: { pid: string } };
  private: { key: [string, string]; value: PrivateRec; indexes: { pid: string } };
  reminders: { key: string; value: ReminderRec; indexes: { pid: string } };
}

export type Store = 'profiles' | 'periods' | 'logs' | 'private' | 'reminders';
export const PROFILE_STORES = ['periods', 'logs', 'private', 'reminders'] as const;

const NAME = 'ritu';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RituDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<RituDB>> {
  dbPromise ??= openDB<RituDB>(NAME, VERSION, {
    upgrade(db) {
      db.createObjectStore('profiles', { keyPath: 'id' });
      db.createObjectStore('periods', { keyPath: 'id' }).createIndex('pid', 'pid');
      db.createObjectStore('logs', { keyPath: ['pid', 'date'] }).createIndex('pid', 'pid');
      db.createObjectStore('private', { keyPath: ['pid', 'date'] }).createIndex('pid', 'pid');
      db.createObjectStore('reminders', { keyPath: 'id' }).createIndex('pid', 'pid');
    },
  });
  return dbPromise;
}

/** Asks the browser not to evict our data under storage pressure (web; a no-op where unsupported). */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    // not supported: data still stays unless the person clears app data
  }
}

// --- change notifications: screens re-read when a store changes (also across open tabs) ---
type Listener = (store: Store, pid: string | null) => void;
const listeners = new Set<Listener>();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ritu-db') : null;
channel?.addEventListener('message', (e: MessageEvent<{ store: Store; pid: string | null }>) =>
  listeners.forEach(l => l(e.data.store, e.data.pid)));

export function onChange(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function emitChange(store: Store, pid: string | null): void {
  listeners.forEach(l => l(store, pid));
  channel?.postMessage({ store, pid });
}

/** Test helper: closes and forgets the open connection. */
export async function _resetDbForTests(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}
