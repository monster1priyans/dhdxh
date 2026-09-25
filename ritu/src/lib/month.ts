import { addDays, fromDay, toDay, type ISODate } from '../../shared/engine';

/** Grid of dates for a month (whole weeks), with nulls for days outside the month. */
export function monthGrid(year: number, month0: number, weekStart: 'sun' | 'mon'): (ISODate | null)[] {
  const first = fromDay(toDay(`${year}-${String(month0 + 1).padStart(2, '0')}-01`));
  const dow = new Date(`${first}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  const lead = weekStart === 'sun' ? dow : (dow + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (ISODate | null)[] = Array(lead).fill(null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export const shiftMonth = (y: number, m0: number, by: number): [number, number] => {
  const t = y * 12 + m0 + by;
  return [Math.floor(t / 12), ((t % 12) + 12) % 12];
};
