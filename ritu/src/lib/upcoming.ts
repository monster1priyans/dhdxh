import { addDays, diffDays, type ISODate } from '../../shared/engine';
import type { Profile } from '../data/types';

export interface UpcomingItem { pid: string; name: string; colour: Profile['colour']; date: ISODate; kind: 'period' | 'fertile' | 'due'; inDays: number }

/** What is coming up in the next `days` days for the given (unlocked) profiles, soonest first. */
export function upcomingEvents(profiles: Profile[], today: ISODate, days = 14): UpcomingItem[] {
  const horizon = addDays(today, days);
  const inWindow = (d: ISODate) => d >= today && d <= horizon;
  const out: UpcomingItem[] = [];
  const push = (p: Profile, date: ISODate, kind: UpcomingItem['kind']) =>
    out.push({ pid: p.id, name: p.name, colour: p.colour, date, kind, inDays: diffDays(date, today) });

  for (const p of profiles) {
    if (p.mode === 'pregnant') {
      if (p.dueDate && inWindow(p.dueDate)) push(p, p.dueDate, 'due');
      continue;
    }
    const cycles = p.prediction?.cycles ?? [];
    const period = cycles.find(c => inWindow(c.start));
    if (period) push(p, period.start, 'period');
    if (p.showFertility) {
      const fertile = cycles.find(c => inWindow(c.fertileStart));
      if (fertile) push(p, fertile.fertileStart, 'fertile');
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}
