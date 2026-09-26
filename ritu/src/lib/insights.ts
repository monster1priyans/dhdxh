import { addDays, cycleLengths, diffDays, sortPeriods, type ISODate, type Period, type Prediction } from '../../shared/engine';
import { SYMPTOMS, type LogRec, type Symptom } from '../data/types';

export interface CycleBar { start: ISODate; length: number }

export function cycleBars(periods: Period[], pred: Prediction | null, n = 12): CycleBar[] {
  const suspects = pred?.missedLogSuspects ?? [];
  return cycleLengths(periods).filter(c => c.length >= 15 && c.length <= 90 && !suspects.includes(c.start)).slice(-n);
}

export function periodBars(periods: Period[], n = 12): CycleBar[] {
  return sortPeriods(periods).filter(p => p.endDate)
    .map(p => ({ start: p.startDate, length: diffDays(p.endDate as ISODate, p.startDate) + 1 }))
    .filter(p => p.length >= 1 && p.length <= 15).slice(-n);
}

export interface Heatmap { symptoms: Symptom[]; days: number; cells: number[][] } // cells[row][day-1] = share 0..1

/** Rows = top 6 symptoms, columns = cycle day 1..35, value = share of cycles with that symptom on that day. */
export function symptomHeatmap(periods: Period[], logs: LogRec[], today: ISODate, days = 35): Heatmap {
  const starts = sortPeriods(periods).map(p => p.startDate);
  const count = new Map<Symptom, number>();
  logs.forEach(l => l.symptoms.forEach(s => count.set(s, (count.get(s) ?? 0) + 1)));
  const symptoms = [...SYMPTOMS].filter(s => count.get(s)).sort((a, b) => (count.get(b) ?? 0) - (count.get(a) ?? 0)).slice(0, 6);
  const byDate = new Map(logs.map(l => [l.date, l]));
  const windows = starts.map((s, i) => [s, i + 1 < starts.length ? addDays(starts[i + 1], -1) : today] as const);
  const cells = symptoms.map(sym => Array.from({ length: days }, (_, d) => {
    let reach = 0;
    let hit = 0;
    for (const [s, e] of windows) {
      const date = addDays(s, d);
      if (date > e) continue;
      reach++;
      if (byDate.get(date)?.symptoms.includes(sym)) hit++;
    }
    return reach ? hit / reach : 0;
  }));
  return { symptoms, days, cells };
}
