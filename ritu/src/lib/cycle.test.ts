import { describe, expect, it } from 'vitest';
import { addDays, computePrediction, DEFAULTS } from '../../shared/engine';
import type { Profile } from '../data/types';
import { paintDay, ringModel, statusOf } from './cycle';

const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21', '2026-06-18'];
const periods = starts.map((s, i) => ({ id: `${i}`, startDate: s, endDate: addDays(s, 4) }));
const profile: Profile = {
  id: 'p', name: 'A', colour: 'rani', birthYear: null, mode: 'track', isManaged: false, showFertility: true,
  discreet: true, settings: DEFAULTS, prediction: computePrediction(periods), createdAt: 0, updatedAt: 0,
};

describe('calendar painting', () => {
  it('paints predicted days only from today on', () => {
    const today = '2026-07-17';
    const st = statusOf(profile, periods, '2026-06-20');
    expect(paintDay('2026-07-17', '2026-06-20', profile, periods, st).predicted).toBe(true);
    expect(paintDay('2026-08-13', today, profile, periods, statusOf(profile, periods, today)).predicted).toBe(true);
  });
  it('drops cycles[0] while late', () => {
    const today = '2026-07-18';
    const st = statusOf(profile, periods, today);
    expect(st.state).toBe('late');
    expect(paintDay('2026-07-19', today, profile, periods, st).predicted).toBe(false);
  });
  it('hides fertile days when showFertility is off', () => {
    const st = statusOf(profile, periods, '2026-06-20');
    expect(paintDay('2026-06-28', '2026-06-20', profile, periods, st).fertile).toBe(true);
    expect(paintDay('2026-06-28', '2026-06-20', { ...profile, showFertility: false }, periods, st).fertile).toBe(false);
  });
});

describe('bangle ring', () => {
  it('lays out the current cycle', () => {
    const r = ringModel('2026-06-20', profile, periods)!;
    expect(r).toEqual({ total: 28, period: [[0, 4]], fertile: [[9, 15]], ovulation: 14, today: 2 });
  });
  it('stretches when late', () => {
    expect(ringModel('2026-07-20', profile, periods)!.total).toBe(33);
  });
});
