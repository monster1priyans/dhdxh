import { kv } from './kv';

const KEY = 'ritu.backup';
const DAY = 86_400_000;
export const BACKUP_EVERY_DAYS = 30;
export const SNOOZE_DAYS = 7;

export interface BackupState { first: number; last: number | null; snoozeUntil: number }

/** Remind about a backup once 30 days have passed since the last one (or since Ritu was first opened). */
export const needsBackup = (s: BackupState, now: number): boolean =>
  now >= s.snoozeUntil && now - (s.last ?? s.first) >= BACKUP_EVERY_DAYS * DAY;

export async function backupState(now = Date.now()): Promise<BackupState> {
  const s = await kv.get<BackupState>(KEY);
  if (s && typeof s.first === 'number') return s;
  const fresh: BackupState = { first: now, last: null, snoozeUntil: 0 };
  await kv.set(KEY, fresh);
  return fresh;
}

export async function markBackedUp(now = Date.now()): Promise<void> {
  await kv.set(KEY, { ...(await backupState(now)), last: now, snoozeUntil: 0 });
}

export async function snoozeBackup(now = Date.now()): Promise<void> {
  await kv.set(KEY, { ...(await backupState(now)), snoozeUntil: now + SNOOZE_DAYS * DAY });
}

export const forgetBackupState = () => kv.remove(KEY);
