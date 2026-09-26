import { describe, expect, it } from 'vitest';
import {
  addDays, computePrediction, dayInfo, healthFlags, localToday, todayStatus,
  type ISODate, type LogLite, type Mode, type Period,
} from './engine';

// Dates without a year are 2026. Periods last 5 days unless noted.
const d = (md: string): ISODate => (md.length === 5 ? `2026-${md}` : md);
const periods = (starts: string[], len = 5): Period[] =>
  starts.map((s, i) => ({ id: `p${i}`, startDate: d(s), endDate: addDays(d(s), len - 1) }));
const range = (id: string, a: string, b: string | null): Period => ({ id, startDate: d(a), endDate: b && d(b) });
const flagTypes = (a: {
  today: string; periods: Period[]; logs?: LogLite[]; age: number | null; mode?: Mode;
}) => {
  const mode = a.mode ?? 'track';
  const pred = computePrediction(a.periods, {}, mode);
  return healthFlags({ today: d(a.today), periods: a.periods, logs: a.logs ?? [], pred, age: a.age, mode })
    .map(f => f.type).sort();
};

describe(`engine golden tests (TZ=${process.env.TZ ?? 'system'})`, () => {
  describe('G1 regular', () => {
    const ps = periods(['01-01', '01-29', '02-26', '03-26', '04-23', '05-21', '06-18']);
    const pred = computePrediction(ps)!;
    const st = (t: string) => todayStatus(d(t), ps, pred);

    it('prediction', () => {
      expect(pred).toMatchObject({ avgCycle: 28, sd: 0, basedOn: 6, confidence: 'high', avgPeriod: 5 });
      expect(pred.cycles[0]).toEqual({
        start: d('07-16'), end: d('07-20'), rangeStart: d('07-15'), rangeEnd: d('07-17'),
        ovulation: d('07-02'), fertileStart: d('06-27'), fertileEnd: d('07-03'),
      });
      expect(pred.cycles[1].start).toBe(d('08-13'));
      expect(pred.cycles[2].start).toBe(d('09-10'));
    });

    it('todayStatus', () => {
      expect(st('06-20')).toMatchObject({ state: 'on_period', cycleDay: 3, phase: 'menstrual' });
      expect(st('06-26')).toMatchObject({ state: 'upcoming', daysUntil: 20, phase: 'follicular', fertile: false });
      expect(st('06-27')).toMatchObject({ fertile: true, phase: 'follicular' });
      expect(st('07-01')).toMatchObject({ cycleDay: 14, daysUntil: 15, phase: 'ovulation', fertile: true });
      expect(st('07-02')).toMatchObject({ ovulation: true });
      expect(st('07-08')).toMatchObject({ phase: 'luteal', fertile: false });
      expect(st('07-15')).toMatchObject({ state: 'due', daysUntil: 1, phase: 'luteal', cycleDay: 28 });
      expect(st('07-16')).toMatchObject({ state: 'due', daysUntil: 0, predictedPeriod: false });
      expect(st('07-18')).toMatchObject({ state: 'late', lateDays: 2, cycleDay: 31, phase: 'late' });
    });

    it('dayInfo on a predicted period day', () => {
      expect(dayInfo(d('07-17'), d('06-20'), ps, pred))
        .toMatchObject({ predictedPeriod: true, phase: 'menstrual', cycleDay: 2 });
    });
  });

  describe('G2 irregular', () => {
    const ps = periods(['01-05', '01-29', '03-08', '04-03', '05-08', '06-06', '07-07']);
    const pred = computePrediction(ps)!;
    it('prediction', () => {
      expect(pred).toMatchObject({ avgCycle: 30.9, sd: 4.9, confidence: 'medium' });
      expect(pred.cycles[0]).toEqual({
        start: d('08-07'), end: d('08-11'), rangeStart: d('08-02'), rangeEnd: d('08-12'),
        ovulation: d('07-24'), fertileStart: d('07-19'), fertileEnd: d('07-25'),
      });
    });
    it('healthFlags', () => {
      expect(flagTypes({ today: '07-10', periods: ps, age: 30 })).toEqual(['irregular']);
      expect(flagTypes({ today: '07-10', periods: ps, age: 16 })).toEqual([]);
    });
  });

  describe('G3 missed log', () => {
    const ps = periods(['01-01', '01-29', '02-26', '04-23', '05-21', '06-18']);
    const pred = computePrediction(ps)!;
    it('prediction', () => {
      expect(pred).toMatchObject({ avgCycle: 28, basedOn: 4, confidence: 'medium', missedLogSuspects: ['2026-02-26'] });
      expect(pred.cycles[0].start).toBe(d('07-16'));
    });
    it('healthFlags', () => {
      expect(healthFlags({ today: d('06-25'), periods: ps, logs: [], pred, age: 30, mode: 'track' }))
        .toEqual([{ type: 'missed_log', level: 'info', date: '2026-02-26' }]);
    });
  });

  describe('G4 one ongoing period', () => {
    const ps = [range('p0', '06-01', null)];
    const pred = computePrediction(ps)!;
    const st = (t: string) => todayStatus(d(t), ps, pred);
    it('prediction', () => {
      expect(pred).toMatchObject({ avgCycle: 28, sd: null, basedOn: 0, confidence: 'low' });
      expect(pred.cycles[0]).toEqual({
        start: d('06-29'), end: d('07-03'), rangeStart: d('06-26'), rangeEnd: d('07-02'),
        ovulation: d('06-15'), fertileStart: d('06-10'), fertileEnd: d('06-16'),
      });
    });
    it('todayStatus', () => {
      expect(st('06-03')).toMatchObject({ state: 'on_period', cycleDay: 3 });
      expect(st('06-08')).toMatchObject({ state: 'on_period', cycleDay: 8 });
      expect(st('06-12')).toMatchObject({ state: 'upcoming', daysUntil: 17, phase: 'follicular', fertile: true });
    });
    it('healthFlags', () => {
      expect(flagTypes({ today: '06-12', periods: ps, age: null })).toEqual(['period_not_ended']);
    });
  });

  it('G5 pregnant mode returns null', () => {
    expect(computePrediction(periods(['01-01', '01-29']), {}, 'pregnant')).toBeNull();
  });

  it('G6 outliers are ignored', () => {
    const pred = computePrediction(periods(['01-01', '01-29', '02-10', '03-12', '07-10', '08-08']))!;
    expect(pred).toMatchObject({ avgCycle: 29.2, sd: 0.8, basedOn: 3, confidence: 'medium' });
    expect(pred.cycles[0].start).toBe(d('09-06'));
    expect(pred.cycles[0].rangeStart).toBe(d('09-05'));
  });

  it('G7 year end and leap year', () => {
    const a = computePrediction(periods(['2026-12-20']))!;
    expect(a.cycles[0]).toMatchObject({ start: '2027-01-17', ovulation: '2027-01-03' });
    const b = computePrediction(periods(['2028-02-10']))!;
    expect(b.cycles[0]).toMatchObject({ start: '2028-03-09', ovulation: '2028-02-24' });
  });

  describe('G8 healthFlags', () => {
    it('short cycles', () => {
      expect(flagTypes({ today: '05-01', periods: periods(['03-01', '03-20', '04-09', '04-28']), age: 30 }))
        .toEqual(['cycle_length']);
    });
    it('long cycles, adult vs minor', () => {
      const ps = periods(['01-01', '02-10', '03-24', '05-04']);
      expect(flagTypes({ today: '05-10', periods: ps, age: 30 })).toEqual(['cycle_length']);
      expect(flagTypes({ today: '05-10', periods: ps, age: 15 })).toEqual([]);
    });
    it('missed period, not when pregnant', () => {
      const ps = periods(['01-01']);
      expect(flagTypes({ today: '04-15', periods: ps, age: 30 })).toEqual(['missed']);
      expect(healthFlags({ today: d('04-15'), periods: ps, logs: [], pred: null, age: 30, mode: 'pregnant' }))
        .toEqual([]);
    });
    it('long periods', () => {
      const ps = [range('a', '01-01', '01-08'), range('b', '01-29', '02-02'), range('c', '02-26', '03-06')];
      expect(flagTypes({ today: '03-10', periods: ps, age: 30 })).toEqual(['long_period']);
    });
    it('symptom patterns', () => {
      const logs: LogLite[] = [
        { date: d('01-02'), flow: 'very_heavy', pain: 9 },
        { date: d('01-30'), flow: 'very_heavy', pain: 3 },
        { date: d('02-27'), flow: 'medium', pain: 9 },
        { date: d('01-15'), flow: 'spotting', pain: null },
        { date: d('02-12'), flow: 'spotting', pain: null },
        { date: d('02-25'), flow: 'spotting', pain: null }, // 1 day before a start: ignored
      ];
      expect(flagTypes({ today: '03-01', periods: periods(['01-01', '01-29', '02-26']), logs, age: 30 }))
        .toEqual(['between_bleeding', 'heavy_flow', 'severe_pain']);
    });
  });

  it('localToday uses the local calendar date', () => {
    expect(localToday(new Date(2026, 0, 31, 23, 59))).toBe('2026-01-31');
    expect(localToday(new Date(2026, 1, 1, 0, 0))).toBe('2026-02-01');
  });
});
