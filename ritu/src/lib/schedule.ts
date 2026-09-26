import { addDays, diffDays, type ISODate } from '../../shared/engine';
import type { Profile, ReminderRec, ReminderType } from '../data/types';

export interface PlannedNotification {
  id: number;
  pid: string;
  type: ReminderType;
  /** one-off: local date + time; repeating: time only */
  date: ISODate | null;
  hour: number;
  minute: number;
  repeatsDaily: boolean;
  /** what the text should say (translated later) */
  text: { kind: 'period_soon'; days: number } | { kind: 'period_late'; days: number }
    | { kind: 'fertile_soon' } | { kind: 'daily_log' } | { kind: 'pill' };
}

/** Stable 31-bit id from pid|type|date (FNV-1a). */
export function notificationId(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) & 0x7fffffff;
}

const parseTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return { hour: h, minute: m };
};

/** Plans the notifications for one profile. `nowDate`/`nowTime` are local; past times are dropped. */
export function planProfile(profile: Profile, reminders: ReminderRec[], nowDate: ISODate, nowTime: string): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  const pred = profile.prediction;
  const add = (r: ReminderRec, date: ISODate | null, text: PlannedNotification['text']) => {
    const { hour, minute } = parseTime(r.time);
    if (date && (date < nowDate || (date === nowDate && r.time <= nowTime))) return;
    out.push({
      id: notificationId(`${profile.id}|${r.type}|${date ?? 'daily'}`),
      pid: profile.id, type: r.type, date, hour, minute, repeatsDaily: date === null, text,
    });
  };

  for (const r of reminders) {
    if (!r.enabled) continue;
    switch (r.type) {
      case 'period_soon':
        if (profile.mode !== 'pregnant' && pred) {
          for (const c of pred.cycles) add(r, addDays(c.start, -r.daysBefore), { kind: 'period_soon', days: r.daysBefore });
        }
        break;
      case 'period_late':
        if (profile.mode !== 'pregnant' && pred) {
          const c0 = pred.cycles[0];
          const day = addDays(c0.rangeEnd, 1);
          add(r, day, { kind: 'period_late', days: diffDays(day, c0.start) });
        }
        break;
      case 'fertile_soon':
        if (profile.showFertility && profile.mode === 'ttc' && pred) {
          for (const c of pred.cycles) add(r, addDays(c.fertileStart, -1), { kind: 'fertile_soon' });
        }
        break;
      case 'daily_log':
        add(r, null, { kind: 'daily_log' });
        break;
      case 'pill':
        if (profile.mode !== 'pregnant') add(r, null, { kind: 'pill' });
        break;
    }
  }
  return out;
}
