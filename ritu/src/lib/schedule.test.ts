import { describe, expect, it } from 'vitest';
import { computePrediction, DEFAULTS } from '../../shared/engine';
import type { Profile, ReminderRec } from '../data/types';
import { notificationId, planProfile } from './schedule';

const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21', '2026-06-18'];
const periods = starts.map((s, i) => ({ id: `${i}`, startDate: s, endDate: null }));
const profile = (over: Partial<Profile> = {}): Profile => ({
  id: 'p1', name: 'Maa', colour: 'rani', birthYear: 1990, mode: 'track', isManaged: false,
  showFertility: false, discreet: true, settings: DEFAULTS, prediction: computePrediction(periods),
  createdAt: 0, updatedAt: 0, ...over,
});
const rem = (type: ReminderRec['type'], enabled = true, daysBefore = 2): ReminderRec =>
  ({ id: type, pid: 'p1', type, enabled, daysBefore, time: '09:00' });

describe('reminder planning', () => {
  it('period_soon fires daysBefore each of the next 3 predicted starts', () => {
    const plan = planProfile(profile(), [rem('period_soon')], '2026-06-20', '12:00');
    expect(plan.map(p => p.date)).toEqual(['2026-07-14', '2026-08-11', '2026-09-08']);
    expect(plan[0]).toMatchObject({ hour: 9, minute: 0, text: { kind: 'period_soon', days: 2 } });
  });

  it('period_late fires the day after the range ends', () => {
    const plan = planProfile(profile(), [rem('period_late')], '2026-06-20', '12:00');
    expect(plan).toMatchObject([{ date: '2026-07-18', text: { kind: 'period_late', days: 2 } }]);
  });

  it('fertile_soon needs showFertility and TTC mode', () => {
    expect(planProfile(profile(), [rem('fertile_soon')], '2026-06-20', '12:00')).toEqual([]);
    const plan = planProfile(profile({ showFertility: true, mode: 'ttc' }), [rem('fertile_soon')], '2026-06-20', '12:00');
    expect(plan[0].date).toBe('2026-06-26');
  });

  it('skips disabled and past reminders, and everything cycle-based while pregnant', () => {
    expect(planProfile(profile(), [rem('period_soon', false)], '2026-06-20', '12:00')).toEqual([]);
    expect(planProfile(profile(), [rem('period_soon')], '2026-07-14', '09:00').map(p => p.date))
      .toEqual(['2026-08-11', '2026-09-08']);
    const preg = profile({ mode: 'pregnant', prediction: null });
    expect(planProfile(preg, [rem('period_soon'), rem('period_late'), rem('pill')], '2026-06-20', '12:00')).toEqual([]);
  });

  it('daily reminders repeat', () => {
    expect(planProfile(profile(), [rem('daily_log')], '2026-06-20', '12:00'))
      .toMatchObject([{ repeatsDaily: true, date: null }]);
  });

  it('ids are stable 31-bit numbers', () => {
    const a = notificationId('p1|period_soon|2026-07-14');
    expect(a).toBe(notificationId('p1|period_soon|2026-07-14'));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(2 ** 31);
    expect(a).not.toBe(notificationId('p1|period_soon|2026-07-15'));
  });
});
