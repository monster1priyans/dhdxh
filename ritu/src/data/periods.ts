import type { ISODate, Period } from '../../shared/engine';
import { emitChange, getDb } from './db';
import type { PeriodRec } from './types';

export async function listPeriods(pid: string): Promise<PeriodRec[]> {
  const all = await (await getDb()).getAllFromIndex('periods', 'pid', pid);
  return all.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export const toEnginePeriods = (ps: PeriodRec[]): Period[] =>
  ps.map(({ id, startDate, endDate }) => ({ id, startDate, endDate }));

export async function addPeriod(pid: string, startDate: ISODate, endDate: ISODate | null): Promise<PeriodRec> {
  const rec: PeriodRec = { id: crypto.randomUUID(), pid, startDate, endDate, updatedAt: Date.now() };
  await (await getDb()).add('periods', rec);
  emitChange('periods', pid);
  return rec;
}

export async function updatePeriod(id: string, patch: Partial<Pick<PeriodRec, 'startDate' | 'endDate'>>): Promise<void> {
  const db = await getDb();
  const cur = await db.get('periods', id);
  if (!cur) throw new Error(`Period ${id} not found`);
  await db.put('periods', { ...cur, ...patch, updatedAt: Date.now() });
  emitChange('periods', cur.pid);
}

export async function deletePeriod(id: string): Promise<void> {
  const db = await getDb();
  const cur = await db.get('periods', id);
  if (!cur) return;
  await db.delete('periods', id);
  emitChange('periods', cur.pid);
}
