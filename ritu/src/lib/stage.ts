import { diffDays, type ISODate, type Period } from '../../shared/engine';
import type { Profile } from '../data/types';

/**
 * The periods that describe her cycles now. Periods that started on or before the day her last pregnancy
 * ended belong to the time before it, so predictions and doctor warnings start fresh after a pregnancy
 * (the engine itself is unchanged; it is just given this history). Calendars and the history list still
 * show every period.
 */
export function cyclePeriods<P extends Period>(profile: Pick<Profile, 'pregnancyEnd'>, periods: P[]): P[] {
  const end = profile.pregnancyEnd?.date;
  return end ? periods.filter(p => p.startDate > end) : periods;
}

/** Bleeding in the first 6 weeks after a birth is usually lochia, not a period. */
export const LOCHIA_DAYS = 42;
/** The after-birth card stays for 12 weeks, even if her periods come back sooner. */
export const AFTER_BIRTH_DAYS = 84;

export type Stage =
  | { kind: 'pregnant' }
  | { kind: 'before_first' }
  | { kind: 'after_birth'; days: number; periodsBack: boolean }
  | { kind: 'after_loss'; days: number }
  | { kind: 'cycles' };

/** Where she is in life, from what is saved on the profile and the periods she logged. */
export function stageOf(profile: Pick<Profile, 'mode' | 'firstPeriodPending' | 'pregnancyEnd'>, periods: Period[], today: ISODate): Stage {
  if (profile.mode === 'pregnant') return { kind: 'pregnant' };
  if (profile.firstPeriodPending && periods.length === 0) return { kind: 'before_first' };
  const end = profile.pregnancyEnd;
  if (end && end.date <= today) {
    const days = diffDays(today, end.date);
    const periodsBack = periods.some(p => p.startDate > end.date);
    if (end.outcome === 'birth' && (!periodsBack || days < AFTER_BIRTH_DAYS)) return { kind: 'after_birth', days, periodsBack };
    if (end.outcome === 'loss' && !periodsBack) return { kind: 'after_loss', days };
  }
  return { kind: 'cycles' };
}

/** After a pregnancy, until the first period comes back: there is nothing to predict from yet. */
export const waitingForPeriods = (s: Stage): boolean =>
  (s.kind === 'after_birth' && !s.periodsBack) || s.kind === 'after_loss';

/** Tapping "Period started" this soon after a birth is worth a question: it is probably lochia. */
export const likelyLochia = (profile: Pick<Profile, 'pregnancyEnd'>, periods: Period[], date: ISODate): boolean => {
  const end = profile.pregnancyEnd;
  if (!end || end.outcome !== 'birth' || date <= end.date) return false;
  return diffDays(date, end.date) < LOCHIA_DAYS && !periods.some(p => p.startDate > end.date);
};
