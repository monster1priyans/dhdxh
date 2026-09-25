import type { TFunction } from 'i18next';
import {
  addDays, dayInfo, diffDays, sortPeriods, todayStatus,
  type ISODate, type Period, type TodayStatus,
} from '../../shared/engine';
import type { Profile } from '../data/types';

export function statusOf(profile: Profile, periods: Period[], today: ISODate): TodayStatus {
  return todayStatus(today, periods, profile.prediction, profile.settings.lutealLen);
}

/** "Day 12, period in 16 days" / "Period expected any day" / "Period is 3 days late" / "On period, day 2" */
export function statusLine(t: TFunction, profile: Profile, st: TodayStatus, hasPeriods: boolean): string {
  if (profile.mode === 'pregnant') return t('status.paused');
  if (!hasPeriods) return t('status.noData');
  switch (st.state) {
    case 'on_period': return t('status.onPeriod', { day: st.cycleDay });
    case 'upcoming': return t('status.upcoming', { day: st.cycleDay, count: st.daysUntil ?? 0 });
    case 'due': return t('status.due');
    case 'late': return t('status.late', { count: st.lateDays });
    default: return t('status.noData');
  }
}

export interface Paint { logged: boolean; predicted: boolean; fertile: boolean; ovulation: boolean; cycleDay: number | null }

/** What a calendar day shows. Predicted days are never painted in the past, and cycles[0] is dropped while late. */
export function paintDay(date: ISODate, today: ISODate, profile: Profile, periods: Period[], st: TodayStatus): Paint {
  const pred = profile.prediction;
  const info = dayInfo(date, today, periods, pred, profile.settings.lutealLen);
  const c0 = pred?.cycles[0];
  const inLateCycle = st.state === 'late' && c0 !== undefined && date >= c0.start && date <= c0.end;
  const showFert = profile.showFertility && profile.mode !== 'pregnant';
  return {
    logged: info.loggedPeriod,
    predicted: info.predictedPeriod && date >= today && !inLateCycle,
    fertile: showFert && info.fertile && !info.loggedPeriod,
    ovulation: showFert && info.ovulation,
    cycleDay: info.cycleDay,
  };
}

export interface RingModel {
  total: number;
  period: [number, number][]; // day index ranges, 0-based, inclusive
  fertile: [number, number][];
  ovulation: number | null;
  today: number | null;
}

const toRanges = (flags: boolean[]): [number, number][] => {
  const out: [number, number][] = [];
  flags.forEach((f, i) => {
    if (!f) return;
    const last = out[out.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else out.push([i, i]);
  });
  return out;
};

/** The current cycle laid out on the bangle: period arc, fertile arc, ovulation bead, today bead. */
export function ringModel(today: ISODate, profile: Profile, periods: Period[]): RingModel | null {
  const sorted = sortPeriods(periods).filter(p => p.startDate <= today);
  if (!sorted.length) return null;
  const start = sorted[sorted.length - 1].startDate;
  const pred = profile.prediction;
  const dayNo = diffDays(today, start) + 1;
  const planned = pred ? diffDays(pred.cycles[0].start, start) : profile.settings.cycleLen;
  const total = Math.max(planned, dayNo, 1);
  const showFert = profile.showFertility && profile.mode !== 'pregnant';
  const infos = Array.from({ length: total }, (_, i) =>
    dayInfo(addDays(start, i), today, periods, pred, profile.settings.lutealLen));
  const ov = showFert ? infos.findIndex(d => d.ovulation) : -1;
  return {
    total,
    period: toRanges(infos.map(d => d.loggedPeriod)),
    fertile: showFert ? toRanges(infos.map(d => d.fertile && !d.loggedPeriod)) : [],
    ovulation: ov >= 0 ? ov : null,
    today: dayNo - 1,
  };
}
