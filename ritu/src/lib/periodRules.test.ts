import { describe, expect, it } from 'vitest';
import { periodOff, periodOn, stretchTo } from './periodRules';

const T = '2026-09-25';
const P = (id: string, s: string, e: string | null) => ({ id, startDate: s, endDate: e });

describe('period ON', () => {
  const ps = [P('a', '2026-09-01', '2026-09-05')];
  it('extends the end when d is the day after it', () => {
    expect(periodOn(ps, '2026-09-06', T).op).toEqual({ type: 'update', id: 'a', endDate: '2026-09-06' });
  });
  it('moves the start when d is the day before it', () => {
    expect(periodOn(ps, '2026-08-31', T).op).toEqual({ type: 'update', id: 'a', startDate: '2026-08-31' });
  });
  it('does nothing inside a period', () => {
    expect(periodOn(ps, '2026-09-03', T).op).toEqual({ type: 'none' });
  });
  it('creates a new period, ongoing when d is today', () => {
    expect(periodOn(ps, T, T)).toEqual({ op: { type: 'create', startDate: T, endDate: null }, nearby: null });
    expect(periodOn(ps, '2026-09-20', T).op).toEqual({ type: 'create', startDate: '2026-09-20', endDate: '2026-09-20' });
  });
  it('flags a start within 10 days of another start', () => {
    const r = periodOn(ps, '2026-09-09', T);
    expect(r.nearby?.id).toBe('a');
    expect(stretchTo(r.nearby!, '2026-09-09', T)).toEqual({ type: 'update', id: 'a', endDate: '2026-09-09' });
  });
  it('treats an ongoing period as running through today', () => {
    const on = [P('b', '2026-09-22', null)];
    expect(periodOn(on, '2026-09-24', T).op).toEqual({ type: 'none' });
  });
});

describe('period OFF', () => {
  it('deletes a one-day period', () => {
    expect(periodOff([P('a', '2026-09-01', '2026-09-01')], '2026-09-01', T)).toEqual({ type: 'delete', id: 'a' });
  });
  it('moves the start forward, pulls the end back, cuts at the middle', () => {
    const ps = [P('a', '2026-09-01', '2026-09-05')];
    expect(periodOff(ps, '2026-09-01', T)).toEqual({ type: 'update', id: 'a', startDate: '2026-09-02' });
    expect(periodOff(ps, '2026-09-05', T)).toEqual({ type: 'update', id: 'a', endDate: '2026-09-04' });
    expect(periodOff(ps, '2026-09-03', T)).toEqual({ type: 'update', id: 'a', endDate: '2026-09-02' });
    expect(periodOff(ps, '2026-09-10', T)).toEqual({ type: 'none' });
  });
  it('handles an ongoing period started today', () => {
    expect(periodOff([P('a', T, null)], T, T)).toEqual({ type: 'delete', id: 'a' });
  });
});
