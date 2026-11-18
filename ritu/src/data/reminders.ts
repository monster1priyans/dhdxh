import { emitChange, getDb } from './db';
import type { ReminderRec, ReminderType } from './types';

export const REMINDER_TYPES: ReminderType[] = ['period_soon', 'period_late', 'fertile_soon', 'daily_log', 'pill'];

const DEFAULTS: Record<ReminderType, Pick<ReminderRec, 'enabled' | 'time' | 'daysBefore'>> = {
  period_soon: { enabled: true, time: '09:00', daysBefore: 2 },
  period_late: { enabled: true, time: '09:00', daysBefore: 0 },
  fertile_soon: { enabled: false, time: '09:00', daysBefore: 1 },
  daily_log: { enabled: false, time: '21:00', daysBefore: 0 },
  pill: { enabled: false, time: '09:00', daysBefore: 0 },
};

export async function listReminders(pid: string): Promise<ReminderRec[]> {
  const got = await (await getDb()).getAllFromIndex('reminders', 'pid', pid);
  // fill in any type she has never touched, with its default
  return REMINDER_TYPES.map(type =>
    got.find(r => r.type === type) ?? { id: `${pid}:${type}`, pid, type, ...DEFAULTS[type] });
}

export async function listAllReminders(): Promise<ReminderRec[]> {
  return (await getDb()).getAll('reminders');
}

export async function saveReminder(r: ReminderRec): Promise<void> {
  await (await getDb()).put('reminders', r);
  emitChange('reminders', r.pid);
}

export async function createDefaultReminders(pid: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('reminders', 'readwrite');
  for (const type of REMINDER_TYPES) await tx.store.put({ id: `${pid}:${type}`, pid, type, ...DEFAULTS[type] });
  await tx.done;
  emitChange('reminders', pid);
}
