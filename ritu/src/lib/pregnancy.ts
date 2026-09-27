import { addDays, diffDays, type ISODate } from '../../shared/engine';

/** A pregnancy is dated as 280 days (40 weeks) from the first day of the last period. */
export const PREGNANCY_DAYS = 280;

export const dueFromLastPeriod = (lmp: ISODate): ISODate => addDays(lmp, PREGNANCY_DAYS);

export interface Gestation {
  /** completed days of pregnancy, counted from the last period */
  days: number;
  weeks: number;
  extraDays: number;
  trimester: 1 | 2 | 3;
  /** days until the due date; negative once it has passed */
  daysLeft: number;
  /** 0..1 along 40 weeks */
  progress: number;
}

export function gestation(dueDate: ISODate, today: ISODate): Gestation {
  const daysLeft = diffDays(dueDate, today);
  const days = PREGNANCY_DAYS - daysLeft;
  const weeks = Math.floor(Math.max(0, days) / 7);
  return {
    days, weeks, extraDays: Math.max(0, days) % 7,
    trimester: weeks < 14 ? 1 : weeks < 28 ? 2 : 3,
    daysLeft,
    progress: Math.min(1, Math.max(0, days / PREGNANCY_DAYS)),
  };
}

/** A due date only makes sense for a current pregnancy: at most 40 weeks ahead, at most 4 weeks past. */
export const isPlausibleDueDate = (due: ISODate, today: ISODate): boolean => {
  const left = diffDays(due, today);
  return left <= PREGNANCY_DAYS && left >= -28;
};

export type CheckupId = 'register' | 'nt_scan' | 'anomaly_scan' | 'glucose' | 'third_trimester' | 'full_term';

/** A general guide to common antenatal check-ups (completed weeks, inclusive). Her doctor may plan differently. */
export const CHECKUPS: { id: CheckupId; from: number; to: number }[] = [
  { id: 'register', from: 4, to: 12 },
  { id: 'nt_scan', from: 11, to: 13 },
  { id: 'anomaly_scan', from: 18, to: 22 },
  { id: 'glucose', from: 24, to: 28 },
  { id: 'third_trimester', from: 28, to: 36 },
  { id: 'full_term', from: 37, to: 42 },
];

export type CheckupState = 'past' | 'now' | 'later';
export const checkupState = (c: { from: number; to: number }, weeks: number): CheckupState =>
  weeks > c.to ? 'past' : weeks >= c.from ? 'now' : 'later';
