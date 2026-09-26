import { describe, expect, it } from 'vitest';
import { monthGrid, shiftMonth } from './month';

describe('month grid', () => {
  it('starts on Sunday or Monday', () => {
    // 1 Sep 2026 is a Tuesday
    expect(monthGrid(2026, 8, 'sun').slice(0, 3)).toEqual([null, null, '2026-09-01']);
    expect(monthGrid(2026, 8, 'mon').slice(0, 2)).toEqual([null, '2026-09-01']);
  });
  it('handles February in a leap year and whole weeks', () => {
    const g = monthGrid(2028, 1, 'sun');
    expect(g.filter(Boolean)).toHaveLength(29);
    expect(g.length % 7).toBe(0);
  });
  it('wraps years', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual([2027, 0]);
    expect(shiftMonth(2026, 0, -1)).toEqual([2025, 11]);
  });
});
