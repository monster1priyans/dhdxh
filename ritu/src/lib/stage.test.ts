import { describe, expect, it } from 'vitest';
import { addDays, computePrediction, DEFAULTS, healthFlags, type Period } from '../../shared/engine';
import type { Profile } from '../data/types';
import { paintDay, ringModel, sinceBirth, statusLine, statusOf } from './cycle';
import { cycleBars } from './insights';
import { cyclePeriods, likelyLochia, stageOf, waitingForPeriods } from './stage';
import { tipGroup } from './tips';
import { upcomingEvents } from './upcoming';

const P = (over: Partial<Profile> = {}): Profile => ({
  id: 'p', name: 'Asha', colour: 'rani', birthYear: 1995, mode: 'track', isManaged: false, showFertility: true,
  discreet: true, settings: DEFAULTS, prediction: null, trackPill: false, dueDate: null,
  firstPeriodPending: false, pregnancyEnd: null, createdAt: 0, updatedAt: 0, ...over,
});
const per = (id: string, startDate: string, len = 5): Period => ({ id, startDate, endDate: addDays(startDate, len - 1) });
// three 28-day cycles, then a pregnancy; the baby is born on 2026-06-01
const before = [per('a', '2025-07-01'), per('b', '2025-07-29'), per('c', '2025-08-26')];
const birth = { date: '2026-06-01', outcome: 'birth' as const };
const t = ((k: string, o?: { count?: number }) => (o?.count !== undefined ? `${k}:${o.count}` : k)) as never;

/** What the app saves after recompute(): the prediction from the cycles since the pregnancy. */
const withPrediction = (p: Profile, ps: Period[]): Profile => ({ ...p, prediction: computePrediction(cyclePeriods(p, ps), p.settings, p.mode) });

describe('life stages', () => {
  it('knows each stage from the profile and her periods', () => {
    const today = '2026-06-20';
    expect(stageOf(P({ mode: 'pregnant' }), before, today)).toEqual({ kind: 'pregnant' });
    expect(stageOf(P({ firstPeriodPending: true }), [], today)).toEqual({ kind: 'before_first' });
    expect(stageOf(P({ firstPeriodPending: true }), [per('x', '2026-06-01')], today)).toEqual({ kind: 'cycles' });
    expect(stageOf(P({ pregnancyEnd: birth }), before, today)).toEqual({ kind: 'after_birth', days: 19, periodsBack: false });
    const back = [...before, per('d', '2026-07-20')];
    expect(stageOf(P({ pregnancyEnd: birth }), back, '2026-07-25')).toEqual({ kind: 'after_birth', days: 54, periodsBack: true });
    expect(stageOf(P({ pregnancyEnd: birth }), back, '2026-09-01')).toEqual({ kind: 'cycles' });
    expect(stageOf(P({ pregnancyEnd: birth }), before, '2027-01-01')).toMatchObject({ kind: 'after_birth', periodsBack: false });
    const loss = { date: '2026-06-01', outcome: 'loss' as const };
    expect(stageOf(P({ pregnancyEnd: loss }), before, today)).toEqual({ kind: 'after_loss', days: 19 });
    expect(stageOf(P({ pregnancyEnd: loss }), [...before, per('d', '2026-07-02')], '2026-07-03')).toEqual({ kind: 'cycles' });
    expect(stageOf(P({ pregnancyEnd: { date: '2026-07-01', outcome: 'birth' } }), before, today)).toEqual({ kind: 'cycles' });
    expect(waitingForPeriods({ kind: 'after_birth', days: 3, periodsBack: false })).toBe(true);
    expect(waitingForPeriods({ kind: 'after_birth', days: 60, periodsBack: true })).toBe(false);
  });

  it('counts cycles only from periods that started after the pregnancy ended', () => {
    const ps = [...before, per('d', '2026-06-01'), per('e', '2026-07-20')];
    expect(cyclePeriods(P({ pregnancyEnd: birth }), ps).map(p => p.id)).toEqual(['e']);
    expect(cyclePeriods(P(), ps)).toHaveLength(5);
  });

  it('after a birth: no "250 days late" and no missed-period warning while waiting for periods', () => {
    const today = '2026-06-20';
    // the problem this fixes: counted from the last period before the pregnancy, she looks very late
    const old = withPrediction(P(), before);
    expect(statusOf(old, before, today)).toMatchObject({ state: 'late' });
    expect(healthFlags({ today, periods: before, logs: [], pred: old.prediction, age: 31, mode: 'track' }).map(f => f.type)).toContain('missed');

    const p = withPrediction(P({ pregnancyEnd: birth }), before);
    expect(p.prediction).toBeNull();
    const st = statusOf(p, before, today);
    expect(st.state).toBe('no_data');
    expect(healthFlags({ today, periods: cyclePeriods(p, before), logs: [], pred: p.prediction, age: 31, mode: 'track' })).toEqual([]);
    expect(statusLine(t, p, st, true, today, stageOf(p, before, today))).toBe('status.birthWeeks:2');
    expect(ringModel(today, p, before)).toBeNull();
    // a future day in the calendar has no cycle day yet; the old periods still show as logged
    expect(paintDay('2026-06-25', today, p, before, st)).toMatchObject({ cycleDay: null, predicted: false, fertile: false });
    expect(paintDay('2025-07-02', today, p, before, st).logged).toBe(true);
  });

  it('when periods come back, predictions restart from them and the pregnancy gap is not a "cycle"', () => {
    const back = [...before, per('d', '2026-08-10'), per('e', '2026-09-08')];
    const p = withPrediction(P({ pregnancyEnd: birth }), back);
    expect(p.prediction?.basedOn).toBe(1);
    expect(p.prediction?.cycles[0].start).toBe('2026-10-06'); // one cycle so far: her usual 28 days
    const today = '2026-09-20';
    const flags = healthFlags({ today, periods: cyclePeriods(p, back), logs: [], pred: p.prediction, age: 31, mode: 'track' });
    expect(flags.map(f => f.type)).not.toContain('irregular');
    expect(statusOf(p, back, today)).toMatchObject({ state: 'upcoming', cycleDay: 13 });
    expect(cycleBars(back, p.prediction, 12, birth.date).map(c => c.length)).toEqual([28, 28, 29]);
  });

  it('asks before counting bleeding soon after a birth as a period', () => {
    const p = P({ pregnancyEnd: birth });
    expect(likelyLochia(p, before, '2026-06-20')).toBe(true);
    expect(likelyLochia(p, before, '2026-07-20')).toBe(false);
    expect(likelyLochia(p, [...before, per('d', '2026-06-25')], '2026-06-28')).toBe(false);
    expect(likelyLochia(P({ pregnancyEnd: { ...birth, outcome: 'loss' } }), before, '2026-06-20')).toBe(false);
    expect(likelyLochia(P(), before, '2026-06-20')).toBe(false);
  });

  it('says how long ago the birth was in days, then weeks, then months', () => {
    expect(sinceBirth(t, 0)).toBe('status.birthToday');
    expect(sinceBirth(t, 9)).toBe('status.birthDays:9');
    expect(sinceBirth(t, 45)).toBe('status.birthWeeks:6');
    expect(sinceBirth(t, 220)).toBe('status.birthMonths:7');
  });

  it('before the first period, the status says so and nothing is predicted', () => {
    const p = withPrediction(P({ firstPeriodPending: true, isManaged: true }), []);
    const st = statusOf(p, [], '2026-06-20');
    expect(statusLine(t, p, st, false, '2026-06-20', stageOf(p, [], '2026-06-20'))).toBe('status.waitingFirst');
  });

  it('picks tips and the 6-week check-up for the stage', () => {
    const today = '2026-06-20';
    const p = P({ pregnancyEnd: { date: '2026-05-15', outcome: 'birth' } });
    const st = statusOf(p, before, today);
    expect(tipGroup(p, st, today, stageOf(p, before, today))).toBe('after_birth');
    expect(tipGroup(P({ firstPeriodPending: true }), st, today, { kind: 'before_first' })).toBe('before_first');
    expect(tipGroup(p, st, today, { kind: 'after_loss', days: 3 })).toBeNull();
    expect(upcomingEvents([p], today)).toEqual([
      { pid: 'p', name: 'Asha', colour: 'rani', date: '2026-06-26', kind: 'checkup', inDays: 6 },
    ]);
  });
});
