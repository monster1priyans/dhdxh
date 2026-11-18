import { addDays, diffDays, type ISODate } from '../../shared/engine';

export interface PeriodLike { id: string; startDate: ISODate; endDate: ISODate | null }

export type PeriodOp =
  | { type: 'none' }
  | { type: 'create'; startDate: ISODate; endDate: ISODate | null }
  | { type: 'update'; id: string; startDate?: ISODate; endDate?: ISODate | null }
  | { type: 'delete'; id: string };

/** An ongoing period (no end yet) covers its start through today. */
export const effectiveEnd = (p: PeriodLike, today: ISODate): ISODate =>
  p.endDate ?? (today > p.startDate ? today : p.startDate);

export const periodCovering = (periods: PeriodLike[], d: ISODate, today: ISODate) =>
  periods.find(p => d >= p.startDate && d <= effectiveEnd(p, today));

/** Turning "period" ON for day d (d is today or in the past). */
export function periodOn(periods: PeriodLike[], d: ISODate, today: ISODate): { op: PeriodOp; nearby: PeriodLike | null } {
  if (periodCovering(periods, d, today)) return { op: { type: 'none' }, nearby: null };
  const endAt = (x: ISODate) => (x === today ? null : x);
  const before = periods.find(p => addDays(effectiveEnd(p, today), 1) === d);
  if (before) return { op: { type: 'update', id: before.id, endDate: endAt(d) }, nearby: null };
  const after = periods.find(p => addDays(p.startDate, -1) === d);
  if (after) return { op: { type: 'update', id: after.id, startDate: d }, nearby: null };
  const nearby = periods.find(p => Math.abs(diffDays(d, p.startDate)) <= 10) ?? null;
  return { op: { type: 'create', startDate: d, endDate: endAt(d) }, nearby };
}

/** "Edit the existing period instead": stretch `p` so it covers day d. */
export function stretchTo(p: PeriodLike, d: ISODate, today: ISODate): PeriodOp {
  if (d < p.startDate) return { type: 'update', id: p.id, startDate: d };
  return { type: 'update', id: p.id, endDate: d === today ? null : d };
}

/** Turning "period" OFF for day d. */
export function periodOff(periods: PeriodLike[], d: ISODate, today: ISODate): PeriodOp {
  const p = periodCovering(periods, d, today);
  if (!p) return { type: 'none' };
  const end = effectiveEnd(p, today);
  if (p.startDate === d && end === d) return { type: 'delete', id: p.id };
  if (p.startDate === d) return { type: 'update', id: p.id, startDate: addDays(d, 1) };
  return { type: 'update', id: p.id, endDate: addDays(d, -1) };
}

/** The period that is still going on today, if any. */
export const ongoingPeriod = (periods: PeriodLike[], today: ISODate) =>
  periods.find(p => p.endDate === null && p.startDate <= today);

export type PeriodEditError = 'future' | 'order' | 'overlap';

/**
 * Checks a period typed in the history screen. `end` null means "still going", which only makes sense
 * for the latest period. The period being edited (same id) is ignored when looking for overlaps.
 */
export function validatePeriodEdit(
  periods: PeriodLike[], edit: { id?: string; start: ISODate; end: ISODate | null }, today: ISODate,
): PeriodEditError | null {
  if (edit.start > today || (edit.end !== null && edit.end > today)) return 'future';
  if (edit.end !== null && edit.end < edit.start) return 'order';
  const end = edit.end ?? today;
  const clash = periods.some(p => p.id !== edit.id && p.startDate <= end && effectiveEnd(p, today) >= edit.start);
  if (clash) return 'overlap';
  // an open period must be the latest one
  if (edit.end === null && periods.some(p => p.id !== edit.id && p.startDate > edit.start)) return 'overlap';
  return null;
}

/** One row of the history screen: a period and the cycle it started (null for the latest, still running). */
export interface HistoryRow { period: PeriodLike; periodDays: number; cycleDays: number | null; ongoing: boolean }

export function historyRows(periods: PeriodLike[], today: ISODate): HistoryRow[] {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return sorted.map((p, i) => {
    const next = sorted[i + 1];
    return {
      period: p,
      periodDays: diffDays(effectiveEnd(p, today), p.startDate) + 1,
      cycleDays: next ? diffDays(next.startDate, p.startDate) : null,
      ongoing: p.endDate === null,
    };
  }).reverse();
}
