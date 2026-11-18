import { diffDays, sortPeriods, type ISODate, type Period } from '../../shared/engine';
import type { LogRec } from '../data/types';

export interface TempPoint { date: ISODate; day: number; temp: number; lh: boolean }

/** Morning temperatures (and positive LH tests) in the current cycle, oldest first. */
export function cycleTemps(periods: Period[], logs: LogRec[], today: ISODate): { start: ISODate | null; points: TempPoint[]; lhDays: { date: ISODate; day: number }[] } {
  const starts = sortPeriods(periods).map(p => p.startDate).filter(s => s <= today);
  const start = starts.length ? starts[starts.length - 1] : null;
  if (!start) return { start, points: [], lhDays: [] };
  const inCycle = logs.filter(l => l.date >= start && l.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  return {
    start,
    points: inCycle.filter(l => l.bbt !== null).map(l => ({ date: l.date, day: diffDays(l.date, start) + 1, temp: l.bbt as number, lh: l.lhTest === 'positive' })),
    lhDays: inCycle.filter(l => l.lhTest === 'positive').map(l => ({ date: l.date, day: diffDays(l.date, start) + 1 })),
  };
}

export interface TempShift { coverLine: number; index: number; date: ISODate }

/**
 * The common "3 over 6" rule: the first 3 readings in a row that are all above the highest of the
 * 6 readings before them, with the third at least 0.2 °C above that line. A lasting rise like this
 * usually appears after ovulation has happened; it cannot predict ovulation or confirm pregnancy.
 */
export function detectShift(points: TempPoint[]): TempShift | null {
  for (let i = 6; i + 2 < points.length; i++) {
    const cover = Math.max(...points.slice(i - 6, i).map(p => p.temp));
    const [a, b, c] = [points[i], points[i + 1], points[i + 2]];
    if (a.temp > cover && b.temp > cover && c.temp >= Math.round((cover + 0.2) * 100) / 100) {
      return { coverLine: cover, index: i, date: a.date };
    }
  }
  return null;
}
