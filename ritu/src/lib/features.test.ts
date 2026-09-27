import { describe, expect, it } from 'vitest';
import { addDays, computePrediction, DEFAULTS, todayStatus } from '../../shared/engine';
import { emptyLog } from '../data/logs';
import type { LogRec, Profile } from '../data/types';
import { checkupState, CHECKUPS, dueFromLastPeriod, gestation, isPlausibleDueDate } from './pregnancy';
import { cycleTemps, detectShift } from './temp';
import { tipGroup, tipKey, TIP_COUNTS } from './tips';
import { upcomingEvents } from './upcoming';
import { cycleBars, habits, moodsByPhase, regularity, topSymptoms, weightSeries } from './insights';
import { historyRows, validatePeriodEdit } from './periodRules';
import { needsBackup } from './backupReminder';

const P = (over: Partial<Profile> = {}): Profile => ({
  id: 'p', name: 'Asha', colour: 'rani', birthYear: 1995, mode: 'track', isManaged: false, showFertility: true,
  discreet: true, settings: DEFAULTS, prediction: null, trackPill: false, dueDate: null, createdAt: 0, updatedAt: 0, ...over,
});
const log = (date: string, over: Partial<LogRec> = {}): LogRec => ({ ...emptyLog('p', date), ...over });
const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21', '2026-06-18'];
const periods = starts.map((s, i) => ({ id: `${i}`, startDate: s, endDate: addDays(s, 4) }));

describe('pregnancy', () => {
  it('dates a pregnancy from the due date', () => {
    const due = dueFromLastPeriod('2026-01-01');
    expect(due).toBe('2026-10-08');
    expect(gestation(due, '2026-01-01')).toMatchObject({ days: 0, weeks: 0, trimester: 1, daysLeft: 280 });
    expect(gestation(due, '2026-04-01')).toMatchObject({ weeks: 12, extraDays: 6, trimester: 1 });
    expect(gestation(due, '2026-04-02')).toMatchObject({ weeks: 13, extraDays: 0, trimester: 1 });
    expect(gestation(due, '2026-04-09').trimester).toBe(2); // 14 weeks
    expect(gestation(due, '2026-07-16').trimester).toBe(3); // 28 weeks
    expect(gestation(due, '2026-10-10')).toMatchObject({ daysLeft: -2, progress: 1 });
  });
  it('rejects due dates that cannot belong to a current pregnancy', () => {
    expect(isPlausibleDueDate('2026-10-08', '2026-01-01')).toBe(true);
    expect(isPlausibleDueDate('2026-10-09', '2026-01-01')).toBe(false); // over 40 weeks away
    expect(isPlausibleDueDate('2026-01-01', '2026-02-01')).toBe(false); // over 4 weeks past
  });
  it('marks check-ups as past, now or later', () => {
    expect(CHECKUPS.map(c => checkupState(c, 12))).toEqual(['now', 'now', 'later', 'later', 'later', 'later']);
    expect(CHECKUPS.map(c => checkupState(c, 30))).toEqual(['past', 'past', 'past', 'past', 'now', 'later']);
  });
});

describe('temperature', () => {
  const temps = [36.4, 36.3, 36.4, 36.35, 36.3, 36.4, 36.45, 36.7, 36.75, 36.8, 36.7];
  const logs = temps.map((t, i) => log(addDays('2026-06-18', i + 5), { bbt: t, lhTest: i === 5 ? 'positive' : null }));
  const series = cycleTemps(periods, logs, '2026-07-05');
  it('collects this cycle only, with cycle days', () => {
    expect(series.start).toBe('2026-06-18');
    expect(series.points[0]).toMatchObject({ date: '2026-06-23', day: 6, temp: 36.4 });
    expect(series.lhDays).toEqual([{ date: '2026-06-28', day: 11 }]);
  });
  it('finds the 3-over-6 rise and its cover line', () => {
    expect(detectShift(series.points)).toEqual({ coverLine: 36.4, index: 6, date: '2026-06-29' });
  });
  it('needs the third reading 0.2 °C above the cover line', () => {
    const flat = [36.4, 36.3, 36.4, 36.35, 36.3, 36.4, 36.5, 36.5, 36.55].map((t, i) => ({ date: `d${i}`, day: i, temp: t, lh: false }));
    expect(detectShift(flat)).toBeNull();
  });
});

describe('tips', () => {
  const pred = computePrediction(periods);
  it('picks the group from the phase, lateness or trimester', () => {
    expect(tipGroup(P(), todayStatus('2026-06-20', periods, pred), '2026-06-20')).toBe('menstrual');
    expect(tipGroup(P(), todayStatus('2026-07-08', periods, pred), '2026-07-08')).toBe('luteal');
    expect(tipGroup(P(), todayStatus('2026-07-20', periods, pred), '2026-07-20')).toBe('late');
    expect(tipGroup(P({ mode: 'pregnant', dueDate: '2026-10-08' }), todayStatus('2026-07-20', periods, null), '2026-07-20')).toBe('trimester3');
    expect(tipGroup(P({ mode: 'pregnant' }), todayStatus('2026-07-20', periods, null), '2026-07-20')).toBeNull();
  });
  it('gives a stable key per day that stays in range', () => {
    const k = tipKey('menstrual', '2026-06-20', 'p');
    expect(k).toBe(tipKey('menstrual', '2026-06-20', 'p'));
    for (let d = 0; d < 20; d++) {
      const n = Number(tipKey('late', addDays('2026-06-20', d), 'x').split('.').pop());
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(TIP_COUNTS.late);
    }
  });
});

describe('coming up', () => {
  it('lists periods, fertile days and due dates in the next two weeks', () => {
    const pred = computePrediction(periods);
    const items = upcomingEvents([
      P({ prediction: pred }),
      P({ id: 'q', name: 'Maa', showFertility: false, prediction: pred }),
      P({ id: 'r', name: 'Didi', mode: 'pregnant', dueDate: '2026-07-10' }),
    ], '2026-07-05');
    expect(items.map(i => [i.name, i.kind, i.date, i.inDays])).toEqual([
      ['Didi', 'due', '2026-07-10', 5],
      ['Asha', 'period', '2026-07-16', 11],
      ['Maa', 'period', '2026-07-16', 11],
    ]);
  });
  it('includes fertile days only when she shows them', () => {
    const pred = computePrediction(periods);
    const items = upcomingEvents([P({ prediction: pred }), P({ id: 'q', name: 'Maa', showFertility: false, prediction: pred })], '2026-06-20');
    expect(items.map(i => [i.name, i.kind, i.date])).toEqual([['Asha', 'fertile', '2026-06-27']]);
  });
});

describe('insights extras', () => {
  it('rates regularity with age-aware limits', () => {
    const bars = (lens: number[]) => lens.map((length, i) => ({ start: `s${i}`, length }));
    expect(regularity(bars([28, 28, 28]), 30)).toEqual({ kind: 'not_enough' });
    expect(regularity(bars([28, 28, 28, 28]), 30)).toEqual({ kind: 'same', count: 4, days: 28 });
    expect(regularity(bars([26, 30, 28, 31]), 30)).toMatchObject({ kind: 'regular', spread: 5 });
    expect(regularity(bars([24, 38, 26, 35]), 30)).toMatchObject({ kind: 'irregular', spread: 14, shortest: 24, longest: 38 });
    expect(regularity(bars([24, 38, 26, 35]), 15)).toMatchObject({ kind: 'young' });
    expect(regularity(cycleBars(periods, computePrediction(periods)), 30).kind).toBe('same');
  });
  it('ranks symptoms by share of logged days', () => {
    const r = topSymptoms([log('2026-01-01', { symptoms: ['cramps', 'acne'] }), log('2026-01-02', { symptoms: ['cramps'] }), log('2026-01-03', { mood: 'calm' }), log('2026-01-04', { pain: 2 })]);
    expect(r).toEqual({ loggedDays: 4, items: [{ symptom: 'cramps', count: 2, pct: 50 }, { symptom: 'acne', count: 1, pct: 25 }] });
  });
  it('groups moods by estimated phase', () => {
    const pred = computePrediction(periods);
    const m = moodsByPhase([log('2026-06-19', { mood: 'sad' }), log('2026-06-20', { mood: 'sad' }), log('2026-07-01', { mood: 'energetic' }), log('2026-07-10', { mood: 'irritable' })], periods, pred, 14, '2026-07-12');
    expect(m).toEqual({ menstrual: [{ mood: 'sad', count: 2 }], follicular: [], ovulation: [{ mood: 'energetic', count: 1 }], luteal: [{ mood: 'irritable', count: 1 }] });
  });
  it('averages sleep and water and counts the pill streak', () => {
    const logs = [
      log('2026-07-01', { sleep: 7, water: 6, pill: 'taken' }),
      log('2026-07-02', { sleep: 8, pill: 'missed' }),
      log('2026-07-03', { pill: 'taken' }),
      log('2026-07-04', { pill: 'taken', weight: 55.5 }),
      log('2025-01-01', { weight: 60 }),
    ];
    expect(habits(logs, '2026-07-05')).toEqual({ sleep: 7.5, water: 6, pillTaken: 3, pillTotal: 4, pillStreak: 2 });
    expect(weightSeries(logs, '2026-07-05')).toEqual([{ date: '2026-07-04', weight: 55.5 }]);
  });
});

describe('period history edits', () => {
  const today = '2026-09-27';
  const ps = [
    { id: 'a', startDate: '2026-07-01', endDate: '2026-07-05' },
    { id: 'b', startDate: '2026-07-29', endDate: '2026-08-02' },
    { id: 'c', startDate: '2026-08-27', endDate: '2026-08-31' },
  ];
  it('rejects future days, reversed dates and overlaps', () => {
    expect(validatePeriodEdit(ps, { start: '2026-09-28', end: null }, today)).toBe('future');
    expect(validatePeriodEdit(ps, { start: '2026-09-20', end: '2026-09-18' }, today)).toBe('order');
    expect(validatePeriodEdit(ps, { start: '2026-07-04', end: '2026-07-08' }, today)).toBe('overlap');
    expect(validatePeriodEdit(ps, { id: 'a', start: '2026-07-01', end: '2026-07-07' }, today)).toBeNull();
    expect(validatePeriodEdit(ps, { id: 'a', start: '2026-07-01', end: null }, today)).toBe('overlap');
    expect(validatePeriodEdit(ps, { start: '2026-09-24', end: null }, today)).toBeNull();
  });
  it('lists periods newest first with their cycle lengths', () => {
    const rows = historyRows(ps, today);
    expect(rows.map(r => [r.period.id, r.periodDays, r.cycleDays])).toEqual([['c', 5, null], ['b', 5, 29], ['a', 5, 28]]);
  });
});

describe('backup reminder', () => {
  const DAY = 86_400_000;
  it('waits 30 days from the last backup, and a snooze holds it for a week', () => {
    const now = 100 * DAY;
    expect(needsBackup({ first: now - 29 * DAY, last: null, snoozeUntil: 0 }, now)).toBe(false);
    expect(needsBackup({ first: now - 30 * DAY, last: null, snoozeUntil: 0 }, now)).toBe(true);
    expect(needsBackup({ first: 0, last: now - 3 * DAY, snoozeUntil: 0 }, now)).toBe(false);
    expect(needsBackup({ first: 0, last: null, snoozeUntil: now + DAY }, now)).toBe(false);
  });
});
