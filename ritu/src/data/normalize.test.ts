import { describe, expect, it } from 'vitest';
import { normalizeLog, normalizeProfile } from './normalize';

describe('normalize', () => {
  it('fills new log fields for records saved by older versions', () => {
    const l = normalizeLog({ pid: 'p', date: '2026-01-02', flow: 'heavy', symptoms: ['cramps'], mood: 'sad', pain: 4, notes: 'x', bbt: 36.5, lhTest: null, updatedAt: 5 });
    expect(l).toEqual({
      pid: 'p', date: '2026-01-02', flow: 'heavy', symptoms: ['cramps'], mood: 'sad', pain: 4, notes: 'x', bbt: 36.5, lhTest: null,
      discharge: null, pill: null, sleep: null, water: null, weight: null, updatedAt: 5,
    });
  });

  it('drops junk and out-of-range values (e.g. from a hand-edited backup)', () => {
    const l = normalizeLog({ date: '2026-01-02', flow: 'torrential', symptoms: ['cramps', 'cramps', 'x'], pain: 42, bbt: 99, weight: -3, sleep: 7.5, water: 8, pill: 'yes', discharge: 'egg_white' }, 'p');
    expect(l).toMatchObject({ flow: null, symptoms: ['cramps'], pain: null, bbt: null, weight: null, sleep: 7.5, water: 8, pill: null, discharge: 'egg_white' });
  });

  it('fills new profile fields and repairs bad settings', () => {
    const p = normalizeProfile({ id: 'a', name: 'Maa', colour: 'red', mode: 'bogus', settings: { cycleLen: 500, periodLen: 5 }, createdAt: 1, updatedAt: 1 });
    expect(p).toMatchObject({ colour: 'jamuni', mode: 'track', trackPill: false, dueDate: null, discreet: true, settings: { cycleLen: 28, periodLen: 5, lutealLen: 14 } });
  });
});
