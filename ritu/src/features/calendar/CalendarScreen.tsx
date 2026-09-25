import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { localToday, type ISODate } from '../../../shared/engine';
import type { PeriodRec, Profile } from '../../data/types';
import { toEnginePeriods } from '../../data/periods';
import { useAllPeriods, useProfileData } from '../../hooks/useProfileData';
import { paintDay, statusOf } from '../../lib/cycle';
import { formatDate, formatLongDate, formatMonth } from '../../lib/format';
import { intlLocale } from '../../i18n';
import { monthGrid, shiftMonth } from '../../lib/month';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { usePrefs } from '../../store/prefs';
import { BottomSheet } from '../../components/BottomSheet';
import { DayCell } from '../../components/DayCell';
import { EmptyState } from '../../components/EmptyState';
import { PinGate } from '../../components/PinGate';
import { ProfileDot } from '../../components/ProfileDot';
import { ProfilePicker } from '../../components/ProfilePicker';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LogSheet } from '../log/LogSheet';

export function CalendarScreen() {
  const { t } = useTranslation();
  const profiles = useProfiles(s => s.profiles);
  const { activePid, setActive } = usePrefs();
  const [everyone, setEveryone] = useState(false);
  const active = profiles.find(p => p.id === activePid) ?? profiles[0];
  const today = localToday();
  const [ym, setYm] = useState<[number, number]>(() => [Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1]);

  if (!active) return (<><ScreenHeader title={t('tabs.calendar')} /><EmptyState icon={CalendarDays} title={t('calendar.empty')} /></>);

  return (
    <>
      <ScreenHeader title={t('tabs.calendar')} />
      {profiles.length > 1 && (
        <div className="mx-4 mb-3 grid grid-cols-2 rounded-full bg-surface p-1" role="radiogroup" aria-label={t('calendar.view')}>
          {[false, true].map(v => (
            <button key={String(v)} type="button" role="radio" aria-checked={everyone === v} onClick={() => setEveryone(v)}
              className={`min-h-11 rounded-full font-medium transition-colors duration-150 ${everyone === v ? 'bg-primary text-on-primary' : 'text-ink-2'}`}>
              {v ? t('calendar.everyone') : t('calendar.thisProfile')}
            </button>
          ))}
        </div>
      )}
      {!everyone && <ProfilePicker profiles={profiles} value={active.id} onChange={setActive} />}
      <MonthNav ym={ym} setYm={setYm} />
      {everyone
        ? <EveryoneMonth ym={ym} setYm={setYm} profiles={profiles} />
        : <PinGate profile={active}><ProfileMonth key={active.id} profile={active} ym={ym} setYm={setYm} /></PinGate>}
    </>
  );
}

function MonthNav({ ym, setYm }: { ym: [number, number]; setYm: (v: [number, number]) => void }) {
  const { t } = useTranslation();
  const btn = 'grid size-11 place-items-center rounded-full bg-surface';
  return (
    <div className="flex items-center justify-between px-4 pb-2">
      <button type="button" className={btn} onClick={() => setYm(shiftMonth(ym[0], ym[1], -1))} aria-label={t('calendar.prev')}><ChevronLeft aria-hidden className="size-5" /></button>
      <h2 className="text-xl" aria-live="polite">{formatMonth(ym[0], ym[1])}</h2>
      <button type="button" className={btn} onClick={() => setYm(shiftMonth(ym[0], ym[1], 1))} aria-label={t('calendar.next')}><ChevronRight aria-hidden className="size-5" /></button>
    </div>
  );
}

function useWeekdays(weekStart: 'sun' | 'mon') {
  return useMemo(() => {
    const f = new Intl.DateTimeFormat(intlLocale(), { weekday: 'narrow', timeZone: 'UTC' });
    const long = new Intl.DateTimeFormat(intlLocale(), { weekday: 'long', timeZone: 'UTC' });
    // 2026-01-04 is a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 4 + i + (weekStart === 'mon' ? 1 : 0)));
      return { short: f.format(d), long: long.format(d) };
    });
  }, [weekStart, intlLocale()]);
}

function Grid({ ym, setYm, render }: { ym: [number, number]; setYm: (v: [number, number]) => void; render: (d: ISODate) => ReactNode }) {
  const weekStart = usePrefs(s => s.weekStart);
  const days = useWeekdays(weekStart);
  const cells = monthGrid(ym[0], ym[1], weekStart);
  const startX = useRef<number | null>(null);
  return (
    <div
      className="touch-pan-y px-3"
      onPointerDown={e => { startX.current = e.clientX; }}
      onPointerUp={e => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) setYm(shiftMonth(ym[0], ym[1], dx < 0 ? 1 : -1));
      }}
    >
      <div role="grid" className="grid grid-cols-7 gap-1">
        {days.map(d => <abbr key={d.long} title={d.long} className="pb-1 text-center text-sm font-medium text-ink-2 no-underline">{d.short}</abbr>)}
        {cells.map((d, i) => <div key={d ?? `x${i}`} role="gridcell">{d ? render(d) : null}</div>)}
      </div>
    </div>
  );
}

function ProfileMonth({ profile, ym, setYm }: { profile: Profile; ym: [number, number]; setYm: (v: [number, number]) => void }) {
  const { t } = useTranslation();
  const { periods, logs } = useProfileData(profile.id);
  const today = localToday();
  const ps = useMemo(() => toEnginePeriods(periods), [periods]);
  const st = statusOf(profile, ps, today);
  const logged = useMemo(() => new Set(logs.map(l => l.date)), [logs]);
  const [logDate, setLogDate] = useState<ISODate | null>(null);
  const [infoDate, setInfoDate] = useState<ISODate | null>(null);
  const showFert = profile.showFertility && profile.mode !== 'pregnant';

  const describe = (d: ISODate) => {
    const p = paintDay(d, today, profile, ps, st);
    const bits = [formatLongDate(d)];
    if (p.logged) bits.push(t('legend.period'));
    if (p.predicted) bits.push(t('legend.predicted'));
    if (p.fertile) bits.push(t('legend.fertile'));
    if (p.ovulation) bits.push(t('legend.ovulation'));
    if (logged.has(d)) bits.push(t('legend.logged'));
    return { p, label: bits.join(', ') };
  };

  const info = infoDate ? paintDay(infoDate, today, profile, ps, st) : null;
  return (
    <>
      <Grid ym={ym} setYm={setYm} render={d => {
        const { p, label } = describe(d);
        return <DayCell day={Number(d.slice(8))} paint={p} isToday={d === today} hasLog={logged.has(d)} label={label}
          onClick={() => (d <= today ? setLogDate(d) : setInfoDate(d))} />;
      }} />
      <Legend showFert={showFert} />
      <LogSheet profile={profile} periods={periods} date={logDate} onClose={() => setLogDate(null)} />
      <BottomSheet open={infoDate !== null} onClose={() => setInfoDate(null)} title={infoDate ? formatLongDate(infoDate) : ''}>
        {info && (
          <div className="flex flex-col gap-2">
            {info.cycleDay !== null && <p className="text-lg font-medium">{t('today.day', { day: info.cycleDay })}</p>}
            {info.predicted && <p>{t('calendar.infoPredicted')}</p>}
            {info.fertile && <p className="text-fertile">{t('calendar.infoFertile')}</p>}
            {info.ovulation && <p className="text-fertile">{t('calendar.infoOvulation')}</p>}
            {!info.predicted && !info.fertile && !info.ovulation && <p className="text-ink-2">{t('calendar.infoNothing')}</p>}
            {(info.fertile || info.ovulation || info.predicted) && <p className="mt-2 text-sm text-ink-2">{t('disclaimer')}</p>}
          </div>
        )}
      </BottomSheet>
    </>
  );
}

function Legend({ showFert }: { showFert: boolean }) {
  const { t } = useTranslation();
  const item = (sw: ReactNode, label: string) => (
    <li className="flex items-center gap-2">{sw}<span>{label}</span></li>
  );
  return (
    <ul className="mx-4 mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-surface p-4 text-sm" aria-label={t('legend.title')}>
      {item(<span className="size-4 rounded-full bg-period" />, t('legend.period'))}
      {item(<span className="size-4 rounded-full border-2 border-dashed border-period bg-period-tint" />, t('legend.predicted'))}
      {showFert && item(<span className="size-4 rounded-full bg-fertile-tint" />, t('legend.fertile'))}
      {showFert && item(<span className="size-4 rounded-full border-2 border-fertile" />, t('legend.ovulation'))}
      {item(<span className="size-4 rounded-full outline-2 outline-ink" />, t('legend.today'))}
      {item(<span className="grid size-4 place-items-center"><span className="size-1.5 rounded-full bg-ink" /></span>, t('legend.logged'))}
    </ul>
  );
}

function EveryoneMonth({ ym, setYm, profiles }: { ym: [number, number]; setYm: (v: [number, number]) => void; profiles: Profile[] }) {
  const { t } = useTranslation();
  const { pinned, unlocked } = useLock();
  const visible = profiles.filter(p => !(pinned[p.id] && !unlocked[p.id]));
  const periods = useAllPeriods(visible.map(p => p.id));
  const today = localToday();
  const [openDay, setOpenDay] = useState<ISODate | null>(null);

  const marks = (d: ISODate) => visible.flatMap(p => {
    const ps = toEnginePeriods(periods[p.id] ?? ([] as PeriodRec[]));
    const paint = paintDay(d, today, p, ps, statusOf(p, ps, today));
    return paint.logged ? [{ p, filled: true }] : paint.predicted ? [{ p, filled: false }] : [];
  });

  return (
    <>
      <Grid ym={ym} setYm={setYm} render={d => {
        const m = marks(d);
        const label = [formatLongDate(d), ...m.map(x => `${x.p.name}: ${x.filled ? t('legend.period') : t('legend.predicted')}`)].join(', ');
        return (
          <button type="button" aria-label={label} onClick={() => setOpenDay(d)}
            className={`flex aspect-square min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[0.9375rem] ${d === today ? 'outline-2 outline-ink' : ''}`}>
            <span>{Number(d.slice(8))}</span>
            <span className="flex h-2 items-center gap-0.5">
              {m.slice(0, 3).map(x => (
                <span key={x.p.id} className="size-2 rounded-full border-2" style={{ borderColor: `var(--bangle-${x.p.colour})`, background: x.filled ? `var(--bangle-${x.p.colour})` : 'transparent' }} />
              ))}
              {m.length > 3 && <span className="text-[0.625rem] leading-none text-ink-2">+{m.length - 3}</span>}
            </span>
          </button>
        );
      }} />
      <ul className="mx-4 mt-4 flex flex-col gap-2 rounded-2xl bg-surface p-4 text-sm" aria-label={t('legend.title')}>
        <li className="flex items-center gap-2"><span className="size-3 rounded-full bg-ink" />{t('legend.dotFilled')}</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded-full border-2 border-ink" />{t('legend.dotHollow')}</li>
        {visible.length < profiles.length && <li className="text-ink-2">{t('calendar.lockedHidden')}</li>}
      </ul>
      <BottomSheet open={openDay !== null} onClose={() => setOpenDay(null)} title={openDay ? formatDate(openDay, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}>
        {openDay && (
          <ul className="flex flex-col gap-3">
            {marks(openDay).length === 0 && <li className="text-ink-2">{t('calendar.infoNothing')}</li>}
            {marks(openDay).map(x => (
              <li key={x.p.id} className="flex items-center gap-2">
                <ProfileDot colour={x.p.colour} />
                <span className="font-medium">{x.p.name}</span>
                <span className="text-ink-2">{x.filled ? t('legend.period') : t('legend.predicted')}</span>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </>
  );
}
