import type { ISODate } from '../../shared/engine';
import { emitChange, getDb } from './db';
import type { LogRec, PrivateRec } from './types';

export const emptyLog = (pid: string, date: ISODate): LogRec => ({
  pid, date, flow: null, symptoms: [], mood: null, pain: null, notes: '', bbt: null, lhTest: null, updatedAt: 0,
});

export async function listLogs(pid: string, from?: ISODate, to?: ISODate): Promise<LogRec[]> {
  const db = await getDb();
  const range = IDBKeyRange.bound([pid, from ?? '0000-00-00'], [pid, to ?? '9999-99-99']);
  return db.getAll('logs', range);
}

export async function getLog(pid: string, date: ISODate): Promise<LogRec | undefined> {
  return (await getDb()).get('logs', [pid, date]);
}

/** Saves the day's log; a log with nothing in it is removed. */
export async function saveLog(log: LogRec): Promise<void> {
  const db = await getDb();
  const empty = log.flow === null && !log.symptoms.length && log.mood === null && log.pain === null
    && !log.notes.trim() && log.bbt === null && log.lhTest === null;
  if (empty) await db.delete('logs', [log.pid, log.date]);
  else await db.put('logs', { ...log, updatedAt: Date.now() });
  emitChange('logs', log.pid);
}

export const emptyPrivate = (pid: string, date: ISODate): PrivateRec => ({
  pid, date, intimacy: null, pregnancyTest: null, note: '', updatedAt: 0,
});

export async function getPrivate(pid: string, date: ISODate): Promise<PrivateRec | undefined> {
  return (await getDb()).get('private', [pid, date]);
}

export async function listPrivate(pid: string): Promise<PrivateRec[]> {
  return (await getDb()).getAllFromIndex('private', 'pid', pid);
}

export async function savePrivate(rec: PrivateRec): Promise<void> {
  const db = await getDb();
  const empty = rec.intimacy === null && rec.pregnancyTest === null && !rec.note.trim();
  if (empty) await db.delete('private', [rec.pid, rec.date]);
  else await db.put('private', { ...rec, updatedAt: Date.now() });
  emitChange('private', rec.pid);
}
