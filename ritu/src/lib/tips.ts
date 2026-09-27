import type { ISODate, TodayStatus } from '../../shared/engine';
import { toDay } from '../../shared/engine';
import type { Profile } from '../data/types';
import { gestation } from './pregnancy';

export type TipGroup = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'late' | 'trimester1' | 'trimester2' | 'trimester3';

/** How many tips each group has in the translations (tips.<group>.1 … n). */
export const TIP_COUNTS: Record<TipGroup, number> = {
  menstrual: 5, follicular: 5, ovulation: 4, luteal: 5, late: 3, trimester1: 4, trimester2: 4, trimester3: 4,
};

export function tipGroup(profile: Profile, st: TodayStatus, today: ISODate): TipGroup | null {
  if (profile.mode === 'pregnant') {
    return profile.dueDate ? (`trimester${gestation(profile.dueDate, today).trimester}` as TipGroup) : null;
  }
  if (st.state === 'late') return 'late';
  if (st.state === 'due') return 'luteal';
  switch (st.phase) {
    case 'menstrual': return 'menstrual';
    case 'follicular': return 'follicular';
    case 'ovulation': return 'ovulation';
    case 'luteal': return 'luteal';
    default: return null;
  }
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** One tip per day: it changes daily and differs between profiles, but stays put within a day. */
export function tipKey(group: TipGroup, today: ISODate, pid: string): string {
  const n = (toDay(today) + hash(pid)) % TIP_COUNTS[group];
  return `tips.${group}.${n + 1}`;
}
