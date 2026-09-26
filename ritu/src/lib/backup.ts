import { getDb, emitChange } from '../data/db';
import { listLogs, listPrivate } from '../data/logs';
import { listPeriods } from '../data/periods';
import { getProfile } from '../data/profiles';
import { listReminders } from '../data/reminders';
import { BANGLE_COLOURS, type LogRec, type PeriodRec, type PrivateRec, type Profile, type ReminderRec } from '../data/types';
import type { ProfileExport } from './export';

export interface Backup { app: 'ritu'; version: 1; exportedAt: string; profiles: ProfileExport[] }

export async function exportProfile(pid: string, includePrivate: boolean): Promise<ProfileExport> {
  const profile = await getProfile(pid);
  if (!profile) throw new Error('Profile not found');
  return {
    profile,
    periods: await listPeriods(pid),
    logs: await listLogs(pid),
    private: includePrivate ? await listPrivate(pid) : [],
    reminders: await listReminders(pid),
  };
}

export async function buildBackup(pids: string[], privateFor: (p: Profile) => boolean): Promise<Backup> {
  const profiles: ProfileExport[] = [];
  for (const pid of pids) {
    const p = await getProfile(pid);
    if (p) profiles.push(await exportProfile(pid, privateFor(p)));
  }
  return { app: 'ritu', version: 1, exportedAt: new Date().toISOString(), profiles };
}

// ---- validation: a backup file is untrusted input ----
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isStr = (v: unknown): v is string => typeof v === 'string';
const isDate = (v: unknown): v is string => isStr(v) && DATE.test(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function checkProfile(v: unknown): v is Profile {
  if (!isObj(v)) return false;
  const s = v.settings;
  return isStr(v.id) && isStr(v.name) && v.name.length <= 80
    && (BANGLE_COLOURS as readonly string[]).includes(v.colour as string)
    && ['track', 'ttc', 'pregnant'].includes(v.mode as string)
    && isObj(s) && typeof s.cycleLen === 'number' && typeof s.periodLen === 'number' && typeof s.lutealLen === 'number';
}

export function parseBackup(text: string): Backup {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Error('not_json'); }
  if (!isObj(raw) || raw.app !== 'ritu') throw new Error('not_ritu');
  // a single-profile export is also accepted
  const entries = Array.isArray(raw.profiles) ? raw.profiles : raw.profile ? [raw] : [];
  const profiles: ProfileExport[] = entries.map(e => {
    if (!isObj(e) || !checkProfile(e.profile)) throw new Error('bad_profile');
    const pid = e.profile.id;
    const periods = arr(e.periods).filter((p): p is PeriodRec => isObj(p) && isStr(p.id) && isDate(p.startDate) && (p.endDate === null || isDate(p.endDate)));
    const logs = arr(e.logs).filter((l): l is LogRec => isObj(l) && isDate(l.date) && Array.isArray(l.symptoms));
    const priv = arr(e.private).filter((l): l is PrivateRec => isObj(l) && isDate(l.date));
    const reminders = arr(e.reminders).filter((r): r is ReminderRec => isObj(r) && isStr(r.type) && isStr(r.time));
    const now = Date.now();
    return {
      profile: {
        ...e.profile, birthYear: typeof e.profile.birthYear === 'number' ? e.profile.birthYear : null,
        isManaged: Boolean(e.profile.isManaged), showFertility: Boolean(e.profile.showFertility),
        discreet: e.profile.discreet !== false, prediction: null,
        createdAt: typeof e.profile.createdAt === 'number' ? e.profile.createdAt : now, updatedAt: now,
      },
      periods: periods.map(p => ({ id: p.id, pid, startDate: p.startDate, endDate: p.endDate, updatedAt: now })),
      logs: logs.map(l => ({
        pid, date: l.date, flow: l.flow ?? null, symptoms: l.symptoms, mood: l.mood ?? null, pain: l.pain ?? null,
        notes: isStr(l.notes) ? l.notes : '', bbt: l.bbt ?? null, lhTest: l.lhTest ?? null, updatedAt: now,
      })),
      private: priv.map(p => ({ pid, date: p.date, intimacy: p.intimacy ?? null, pregnancyTest: p.pregnancyTest ?? null, note: isStr(p.note) ? p.note : '', updatedAt: now })),
      reminders: reminders.map(r => ({ ...r, pid, id: `${pid}:${r.type}` })),
    };
  });
  if (!profiles.length) throw new Error('empty');
  return { app: 'ritu', version: 1, exportedAt: isStr(raw.exportedAt) ? raw.exportedAt : '', profiles };
}

/** Writes a backup into this phone. A profile already here with the same id is replaced. */
export async function restoreBackup(b: Backup): Promise<string[]> {
  const db = await getDb();
  const stores = ['profiles', 'periods', 'logs', 'private', 'reminders'] as const;
  const tx = db.transaction([...stores], 'readwrite');
  for (const e of b.profiles) {
    const pid = e.profile.id;
    for (const s of ['periods', 'logs', 'private', 'reminders'] as const) {
      const store = tx.objectStore(s);
      for (const key of await store.index('pid').getAllKeys(pid)) await store.delete(key);
    }
    await tx.objectStore('profiles').put(e.profile);
    for (const p of e.periods) await tx.objectStore('periods').put(p);
    for (const l of e.logs) await tx.objectStore('logs').put(l);
    for (const p of e.private) await tx.objectStore('private').put(p);
    for (const r of e.reminders) await tx.objectStore('reminders').put(r);
  }
  await tx.done;
  for (const s of stores) emitChange(s, null);
  return b.profiles.map(e => e.profile.id);
}
