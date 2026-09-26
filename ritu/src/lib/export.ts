import { diffDays } from '../../shared/engine';
import type { LogRec, PeriodRec, PrivateRec, Profile, ReminderRec } from '../data/types';

// Spreadsheet apps run cells starting with = + - @ as formulas; neutralise them.
const cell = (v: unknown): string => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows: unknown[][]) => rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';

export function periodsCsv(periods: PeriodRec[]): string {
  return csv([
    ['start_date', 'end_date', 'length_days'],
    ...[...periods].sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map(p => [p.startDate, p.endDate ?? '', p.endDate ? diffDays(p.endDate, p.startDate) + 1 : '']),
  ]);
}

export function logsCsv(logs: LogRec[]): string {
  return csv([
    ['date', 'flow', 'symptoms', 'mood', 'pain', 'bbt_c', 'lh_test', 'notes'],
    ...[...logs].sort((a, b) => a.date.localeCompare(b.date))
      .map(l => [l.date, l.flow ?? '', l.symptoms.join(';'), l.mood ?? '', l.pain ?? '', l.bbt ?? '', l.lhTest ?? '', l.notes]),
  ]);
}

export interface ProfileExport {
  profile: Profile;
  periods: PeriodRec[];
  logs: LogRec[];
  private: PrivateRec[];
  reminders: ReminderRec[];
}

export const profileJson = (e: ProfileExport): string =>
  JSON.stringify({ app: 'ritu', version: 1, exportedAt: new Date().toISOString(), ...e }, null, 2);
