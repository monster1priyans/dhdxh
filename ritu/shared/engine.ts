// shared/engine.ts — pure cycle logic. No React, no Firebase, no Date objects in the API.
export type ISODate = string; // "YYYY-MM-DD"
export type Mode = 'track' | 'ttc' | 'pregnant';
export type Flow = 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy';
export type Confidence = 'high' | 'medium' | 'low';
export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'late' | 'unknown';
export type CycleState = 'no_data' | 'on_period' | 'upcoming' | 'due' | 'late';

export interface Period { id: string; startDate: ISODate; endDate: ISODate | null }
export interface CycleSettings { cycleLen: number; periodLen: number; lutealLen: number }
export interface PredictedCycle {
  start: ISODate; end: ISODate;           // predicted period days
  rangeStart: ISODate; rangeEnd: ISODate; // uncertainty window around `start`
  ovulation: ISODate;                     // ovulation BEFORE this period
  fertileStart: ISODate; fertileEnd: ISODate;
}
export interface Prediction {
  lastStart: ISODate;
  cycles: PredictedCycle[];               // next 3
  avgCycle: number; avgPeriod: number; sd: number | null;
  basedOn: number; confidence: Confidence;
  missedLogSuspects: ISODate[];           // starts of cycles ~2x typical length
}
export interface DayInfo {
  cycleDay: number | null; phase: Phase;
  loggedPeriod: boolean; predictedPeriod: boolean; fertile: boolean; ovulation: boolean;
}
export interface TodayStatus extends DayInfo { state: CycleState; daysUntil: number | null; lateDays: number }
export interface LogLite { date: ISODate; flow: Flow | null; pain: number | null }
export type FlagType = 'cycle_length' | 'irregular' | 'long_period' | 'missed' | 'heavy_flow'
  | 'severe_pain' | 'between_bleeding' | 'missed_log' | 'period_not_ended';
export interface HealthFlag { type: FlagType; level: 'doctor' | 'info'; date?: ISODate }

export const DEFAULTS: CycleSettings = { cycleLen: 28, periodLen: 5, lutealLen: 14 };

// dates = whole days as integers in UTC, so timezones can never shift a date
const DAY_MS = 86_400_000;
export const toDay = (d: ISODate): number => {
  const [y, m, dd] = d.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, dd) / DAY_MS);
};
export const fromDay = (n: number): ISODate => new Date(n * DAY_MS).toISOString().slice(0, 10);
export const addDays = (d: ISODate, n: number): ISODate => fromDay(toDay(d) + n);
export const diffDays = (a: ISODate, b: ISODate): number => toDay(a) - toDay(b); // a minus b
export const localToday = (now = new Date()): ISODate =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const inRange = (d: ISODate, a: ISODate, b: ISODate) => d >= a && d <= b; // ISO strings compare correctly
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function sortPeriods(periods: Period[]): Period[] {
  const seen = new Set<ISODate>();
  return [...periods]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .filter(p => {
      if (seen.has(p.startDate)) return false;
      seen.add(p.startDate);
      return true;
    });
}

export function cycleLengths(periods: Period[]): { start: ISODate; length: number }[] {
  const s = sortPeriods(periods);
  return s.slice(1).map((p, i) => ({ start: s[i].startDate, length: diffDays(p.startDate, s[i].startDate) }));
}

// An unended period is assumed to last avgPeriod days; the latest one also stretches
// through today, capped at day 10 (after that the app asks "Has your period ended?").
function periodEnd(p: Period, avgPeriod: number, today: ISODate, isLatest: boolean): ISODate {
  if (p.endDate) return p.endDate;
  const assumed = addDays(p.startDate, avgPeriod - 1);
  if (!isLatest) return assumed;
  const cap = addDays(p.startDate, 9);
  const upToToday = today < cap ? today : cap;
  return upToToday > assumed ? upToToday : assumed;
}

export function computePrediction(
  periods: Period[], settings: Partial<CycleSettings> = {}, mode: Mode = 'track',
): Prediction | null {
  const sorted = sortPeriods(periods);
  if (mode === 'pregnant' || sorted.length === 0) return null;
  const cfg = { ...DEFAULTS, ...settings };

  // only 15–90 day cycles count; a cycle ~2x the median looks like a missed log
  let valid = cycleLengths(sorted).filter(c => c.length >= 15 && c.length <= 90);
  const missedLogSuspects: ISODate[] = [];
  if (valid.length >= 3) {
    const m = median(valid.map(c => c.length));
    valid = valid.filter(c => {
      if (Math.abs(c.length - 2 * m) > 5) return true;
      missedLogSuspects.push(c.start);
      return false;
    });
  }

  // weighted mean of the last 6 cycles; newest weighs most (weights 1..n)
  const used = valid.slice(-6).map(c => c.length);
  const n = used.length;
  let avgCycle = cfg.cycleLen;
  let sd: number | null = null;
  if (n >= 2) {
    avgCycle = used.reduce((acc, len, i) => acc + len * (i + 1), 0) / ((n * (n + 1)) / 2);
    const mu = mean(used);
    sd = Math.sqrt(mean(used.map(l => (l - mu) ** 2)));
  }

  const lens = sorted.filter(p => p.endDate)
    .map(p => diffDays(p.endDate as ISODate, p.startDate) + 1)
    .filter(l => l >= 1 && l <= 15)
    .slice(-6);
  const avgPeriod = lens.length ? Math.round(mean(lens)) : cfg.periodLen;

  const step = Math.round(avgCycle);
  const half = sd === null ? 3 : Math.max(1, Math.round(sd));
  const lastStart = sorted[sorted.length - 1].startDate;
  const cycles = [1, 2, 3].map((k): PredictedCycle => {
    const start = addDays(lastStart, step * k);
    const ovulation = addDays(start, -cfg.lutealLen);
    return {
      start, end: addDays(start, avgPeriod - 1),
      rangeStart: addDays(start, -half), rangeEnd: addDays(start, half),
      ovulation, fertileStart: addDays(ovulation, -5), fertileEnd: addDays(ovulation, 1),
    };
  });

  const confidence: Confidence =
    sd !== null && n >= 6 && sd <= 2 ? 'high' : sd !== null && n >= 3 && sd <= 7 ? 'medium' : 'low';
  const r1 = (x: number) => Math.round(x * 10) / 10;
  return {
    lastStart, cycles, avgCycle: r1(avgCycle), avgPeriod, sd: sd === null ? null : r1(sd),
    basedOn: n, confidence, missedLogSuspects,
  };
}

export function dayInfo(
  date: ISODate, today: ISODate, periods: Period[], pred: Prediction | null, lutealLen = DEFAULTS.lutealLen,
): DayInfo {
  const none: DayInfo = {
    cycleDay: null, phase: 'unknown', loggedPeriod: false, predictedPeriod: false, fertile: false, ovulation: false,
  };
  const sorted = sortPeriods(periods);
  if (!sorted.length) return none;
  const avgP = pred?.avgPeriod ?? DEFAULTS.periodLen;
  const predicted = pred?.cycles ?? [];

  const loggedPeriod = sorted.some((p, i) =>
    inRange(date, p.startDate, periodEnd(p, avgP, today, i === sorted.length - 1)));
  const predictedPeriod = !loggedPeriod && predicted.some(c => inRange(date, c.start, c.end));

  const starts = [...sorted.map(p => p.startDate), ...predicted.map(c => c.start)];
  let i = -1;
  starts.forEach((s, k) => { if (s <= date) i = k; });
  if (i < 0) return none;

  const cycleDay = diffDays(date, starts[i]) + 1;
  const next = starts[i + 1];
  if (!next) {
    return { ...none, cycleDay, loggedPeriod, predictedPeriod, phase: loggedPeriod || predictedPeriod ? 'menstrual' : 'unknown' };
  }
  const d = diffDays(date, addDays(next, -lutealLen)); // days from ovulation
  const phase: Phase = loggedPeriod || predictedPeriod ? 'menstrual'
    : Math.abs(d) <= 1 ? 'ovulation' : d < 0 ? 'follicular' : 'luteal';
  return { cycleDay, phase, loggedPeriod, predictedPeriod, fertile: d >= -5 && d <= 1, ovulation: d === 0 };
}

export function todayStatus(
  today: ISODate, periods: Period[], pred: Prediction | null, lutealLen = DEFAULTS.lutealLen,
): TodayStatus {
  const info = dayInfo(today, today, periods, pred, lutealLen);
  if (info.loggedPeriod) return { ...info, state: 'on_period', daysUntil: null, lateDays: 0 };
  if (!pred) return { ...info, state: 'no_data', daysUntil: null, lateDays: 0 };
  const c0 = pred.cycles[0];
  const daysUntil = diffDays(c0.start, today);
  if (today < c0.rangeStart) return { ...info, state: 'upcoming', daysUntil, lateDays: 0 };
  // expected period not logged yet: never claim she is menstruating
  const base = {
    ...info, predictedPeriod: false, fertile: false, ovulation: false,
    cycleDay: diffDays(today, pred.lastStart) + 1,
  };
  if (today <= c0.rangeEnd) {
    return { ...base, phase: 'luteal', state: 'due', daysUntil, lateDays: Math.max(0, -daysUntil) };
  }
  return { ...base, phase: 'late', state: 'late', daysUntil, lateDays: -daysUntil };
}

export function healthFlags(a: {
  today: ISODate; periods: Period[]; logs: LogLite[]; pred: Prediction | null; age: number | null; mode: Mode;
}): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const sorted = sortPeriods(a.periods);
  if (!sorted.length) return flags;
  const minor = a.age !== null && a.age < 18;
  const suspects = a.pred?.missedLogSuspects ?? [];
  const cycles = cycleLengths(sorted).filter(c => !suspects.includes(c.start)).map(c => c.length);

  const last3 = cycles.slice(-3);
  if (last3.length === 3 && last3.every(l => l < 21 || l > (minor ? 45 : 35))) {
    flags.push({ type: 'cycle_length', level: 'doctor' });
  }
  const last6 = cycles.slice(-6);
  if (!minor && last6.length >= 4) {
    const limit = a.age !== null && a.age >= 26 && a.age <= 41 ? 7 : 9;
    if (Math.max(...last6) - Math.min(...last6) > limit) flags.push({ type: 'irregular', level: 'doctor' });
  }
  const ended = sorted.filter(p => p.endDate).slice(-3);
  if (ended.filter(p => diffDays(p.endDate as ISODate, p.startDate) + 1 > 7).length >= 2) {
    flags.push({ type: 'long_period', level: 'doctor' });
  }
  const last = sorted[sorted.length - 1];
  if (a.mode !== 'pregnant' && diffDays(a.today, last.startDate) > 90) {
    flags.push({ type: 'missed', level: 'doctor' });
  }

  // symptom patterns: how many of the last 3 cycles (current one included) show them
  const avgP = a.pred?.avgPeriod ?? DEFAULTS.periodLen;
  const starts = sorted.map(p => p.startDate);
  const recent = starts.slice(-3);
  const windows = recent.map((s, i) => [s, i + 1 < recent.length ? addDays(recent[i + 1], -1) : a.today] as const);
  const inPeriod = (d: ISODate) =>
    sorted.some((p, i) => inRange(d, p.startDate, periodEnd(p, avgP, a.today, i === sorted.length - 1)));
  const justBeforeStart = (d: ISODate) => starts.some(s => { const x = diffDays(s, d); return x >= 1 && x <= 2; });
  const cyclesWith = (test: (l: LogLite) => boolean) =>
    windows.filter(([s, e]) => a.logs.some(l => inRange(l.date, s, e) && test(l))).length;

  if (cyclesWith(l => l.flow === 'very_heavy') >= 2) flags.push({ type: 'heavy_flow', level: 'doctor' });
  if (cyclesWith(l => (l.pain ?? 0) >= 8) >= 2) flags.push({ type: 'severe_pain', level: 'doctor' });
  if (cyclesWith(l => l.flow !== null && !inPeriod(l.date) && !justBeforeStart(l.date)) >= 2) {
    flags.push({ type: 'between_bleeding', level: 'doctor' });
  }
  suspects.forEach(date => flags.push({ type: 'missed_log', level: 'info', date }));
  if (!last.endDate && diffDays(a.today, last.startDate) >= 10) {
    flags.push({ type: 'period_not_ended', level: 'info', date: last.startDate });
  }
  return flags;
}
