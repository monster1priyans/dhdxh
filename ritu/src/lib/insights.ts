import { addDays, cycleLengths, dayInfo, diffDays, sortPeriods, type ISODate, type Period, type Prediction } from '../../shared/engine';
import { MOODS, SYMPTOMS, type LogRec, type Mood, type Symptom } from '../data/types';

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

// ---------- regularity ----------
export type Regularity =
  | { kind: 'not_enough' }
  | { kind: 'same'; count: number; days: number }
  | { kind: 'regular' | 'irregular' | 'young'; spread: number; shortest: number; longest: number };

/** How much her recent cycles vary. Uses the same limits as the engine's "irregular" flag. */
export function regularity(bars: CycleBar[], age: number | null): Regularity {
  const lens = bars.slice(-6).map(b => b.length);
  if (lens.length < 4) return { kind: 'not_enough' };
  const shortest = Math.min(...lens);
  const longest = Math.max(...lens);
  const spread = longest - shortest;
  if (spread === 0) return { kind: 'same', count: lens.length, days: shortest };
  const limit = age !== null && age >= 26 && age <= 41 ? 7 : 9;
  if (spread <= limit) return { kind: 'regular', spread, shortest, longest };
  return { kind: age !== null && age < 18 ? 'young' : 'irregular', spread, shortest, longest };
}

// ---------- symptoms and moods ----------
export interface SymptomShare { symptom: Symptom; count: number; pct: number }

/** Most-logged symptoms, as a share of the days she logged anything. */
export function topSymptoms(logs: LogRec[], n = 6): { loggedDays: number; items: SymptomShare[] } {
  const count = new Map<Symptom, number>();
  logs.forEach(l => l.symptoms.forEach(s => count.set(s, (count.get(s) ?? 0) + 1)));
  const loggedDays = logs.length;
  const items = [...count.entries()]
    .sort((a, b) => b[1] - a[1] || SYMPTOMS.indexOf(a[0]) - SYMPTOMS.indexOf(b[0]))
    .slice(0, n)
    .map(([symptom, c]) => ({ symptom, count: c, pct: loggedDays ? Math.round((c / loggedDays) * 100) : 0 }));
  return { loggedDays, items };
}

export type MoodPhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export const MOOD_PHASES: MoodPhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

/** Logged moods grouped by the estimated phase of the day they were logged (top 3 per phase). */
export function moodsByPhase(logs: LogRec[], periods: Period[], pred: Prediction | null, lutealLen: number, today: ISODate):
  Record<MoodPhase, { mood: Mood; count: number }[]> {
  const counts: Record<MoodPhase, Map<Mood, number>> = { menstrual: new Map(), follicular: new Map(), ovulation: new Map(), luteal: new Map() };
  for (const l of logs) {
    if (!l.mood || l.date > today) continue;
    const phase = dayInfo(l.date, today, periods, pred, lutealLen).phase;
    if (phase === 'menstrual' || phase === 'follicular' || phase === 'ovulation' || phase === 'luteal') {
      counts[phase].set(l.mood, (counts[phase].get(l.mood) ?? 0) + 1);
    }
  }
  const top = (m: Map<Mood, number>) => [...m.entries()]
    .sort((a, b) => b[1] - a[1] || MOODS.indexOf(a[0]) - MOODS.indexOf(b[0])).slice(0, 3).map(([mood, count]) => ({ mood, count }));
  return { menstrual: top(counts.menstrual), follicular: top(counts.follicular), ovulation: top(counts.ovulation), luteal: top(counts.luteal) };
}

// ---------- body and habits ----------
export interface Habits { sleep: number | null; water: number | null; pillTaken: number; pillTotal: number; pillStreak: number }

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** Averages over the last `days` days, from the days she logged each value. */
export function habits(logs: LogRec[], today: ISODate, days = 30): Habits {
  const from = addDays(today, -(days - 1));
  const recent = logs.filter(l => l.date >= from && l.date <= today);
  const pills = recent.filter(l => l.pill !== null);
  // streak: consecutive "taken" days ending today (or yesterday, if today isn't logged yet)
  const byDate = new Map(logs.map(l => [l.date, l.pill]));
  let d = byDate.get(today) === undefined || byDate.get(today) === null ? addDays(today, -1) : today;
  let pillStreak = 0;
  while (byDate.get(d) === 'taken') { pillStreak++; d = addDays(d, -1); }
  return {
    sleep: avg(recent.flatMap(l => (l.sleep === null ? [] : [l.sleep]))),
    water: avg(recent.flatMap(l => (l.water === null ? [] : [l.water]))),
    pillTaken: pills.filter(l => l.pill === 'taken').length,
    pillTotal: pills.length,
    pillStreak,
  };
}

export const weightSeries = (logs: LogRec[], today: ISODate): { date: ISODate; weight: number }[] => {
  const from = addDays(today, -365);
  return logs.filter(l => l.weight !== null && l.date >= from && l.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date)).map(l => ({ date: l.date, weight: l.weight as number }));
};

