import type { TFunction } from 'i18next';
import {
  addDays, dayInfo, diffDays, localToday, sortPeriods, todayStatus,
  type ISODate, type Period, type TodayStatus,
} from '../../shared/engine';
import type { Profile } from '../data/types';
import { gestation } from './pregnancy';
import { cyclePeriods, type Stage } from './stage';

/** Today's place in her cycle, counted from the periods since her last pregnancy (if any). */
export function statusOf(profile: Profile, periods: Period[], today: ISODate): TodayStatus {
  return todayStatus(today, cyclePeriods(profile, periods), profile.prediction, profile.settings.lutealLen);
}

/** "Day 12, period in 16 days" / "Period expected any day" / "Period is 3 days late" / "On period, day 2" */
export function statusLine(
  t: TFunction, profile: Profile, st: TodayStatus, hasPeriods: boolean, today: ISODate = localToday(), stage?: Stage,
): string {
  if (profile.mode === 'pregnant') {
    return profile.dueDate ? t('status.pregnant', { week: gestation(profile.dueDate, today).weeks + 1 }) : t('status.paused');
  }
  if (stage?.kind === 'before_first') return t('status.waitingFirst');
  if (stage?.kind === 'after_loss') return t('status.afterLoss');
  if (stage?.kind === 'after_birth' && !stage.periodsBack) return sinceBirth(t, stage.days);
  if (!hasPeriods) return t('status.noData');
  switch (st.state) {
    case 'on_period': return t('status.onPeriod', { day: st.cycleDay });
    case 'upcoming': return t('status.upcoming', { day: st.cycleDay, count: st.daysUntil ?? 0 });
    case 'due': return t('status.due');
    case 'late': return t('status.late', { count: st.lateDays });
    default: return t('status.noData');
  }
}

/** "Baby born today" / "9 days since the birth" / "6 weeks since the birth" / "7 months since the birth" */
export function sinceBirth(t: TFunction, days: number): string {
  if (days <= 0) return t('status.birthToday');
  if (days < 14) return t('status.birthDays', { count: days });
  if (days < 182) return t('status.birthWeeks', { count: Math.floor(days / 7) });
  return t('status.birthMonths', { count: Math.floor(days / 30.4375) });
}

export interface Paint { logged: boolean; predicted: boolean; fertile: boolean; ovulation: boolean; cycleDay: number | null }

/** What a calendar day shows. Predicted days are never painted in the past, and cycles[0] is dropped while late. */
export function paintDay(date: ISODate, today: ISODate, profile: Profile, periods: Period[], st: TodayStatus): Paint {
  const pred = profile.prediction;
  const end = profile.pregnancyEnd?.date;
  // after a pregnancy, cycle days and fertile days count from the periods since it; logged periods always show
  const cp = end && date > end ? cyclePeriods(profile, periods) : periods;
  const info = dayInfo(date, today, cp, pred, profile.settings.lutealLen);
  const loggedPeriod = cp === periods ? info.loggedPeriod : dayInfo(date, today, periods, pred, profile.settings.lutealLen).loggedPeriod;
  const c0 = pred?.cycles[0];
  const inLateCycle = st.state === 'late' && c0 !== undefined && date >= c0.start && date <= c0.end;
  const showFert = profile.showFertility && profile.mode !== 'pregnant';
  return {
    logged: loggedPeriod,
    predicted: info.predictedPeriod && date >= today && !inLateCycle && !loggedPeriod,
    fertile: showFert && info.fertile && !loggedPeriod,
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
export function ringModel(today: ISODate, profile: Profile, allPeriods: Period[]): RingModel | null {
  const periods = cyclePeriods(profile, allPeriods);
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
