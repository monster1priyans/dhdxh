import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CalendarClock, CalendarPlus, DatabaseBackup, Lock, Plus, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { localToday } from '../../../shared/engine';
import type { PeriodRec, Profile } from '../../data/types';
import { toEnginePeriods } from '../../data/periods';
import { useAllPeriods } from '../../hooks/useProfileData';
import { ringModel, statusLine, statusOf } from '../../lib/cycle';
import { formatDate, formatDateTime, formatLongDate } from '../../lib/format';
import { backupState, needsBackup, snoozeBackup } from '../../lib/backupReminder';
import { upcomingEvents } from '../../lib/upcoming';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { BangleRing } from '../../components/BangleRing';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { NearbyPeriodSheet } from '../log/NearbyPeriodSheet';
import { StartDateSheet } from '../log/StartDateSheet';
import { usePeriodActions } from '../log/usePeriodActions';

export function HomeScreen() {
  const { t } = useTranslation();
  const profiles = useProfiles(s => s.profiles);
  const periods = useAllPeriods(profiles.map(p => p.id));

  return (
    <>
      <ScreenHeader title={t('app.name')} sub={formatLongDate(localToday())} />
      {profiles.length === 0 ? (
        <EmptyState icon={UserPlus} title={t('home.empty')}>
          <Link to="/onboarding?add=1" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-medium text-on-primary">
            {t('home.addProfile')}
          </Link>
        </EmptyState>
      ) : (
        <>
          <ul className="mx-4 divide-y divide-line overflow-hidden rounded-2xl bg-surface">
            {profiles.map(p => <Row key={p.id} profile={p} periods={periods[p.id] ?? []} />)}
          </ul>
          <div className="px-4 pt-4">
            <Link to="/onboarding?add=1" className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-medium text-primary">
              <Plus aria-hidden className="size-5" />
              {t('home.addProfile')}
            </Link>
          </div>
          <ComingUp profiles={profiles} />
          <BackupNudge hasData={Object.values(periods).some(ps => ps.length > 0)} />
        </>
      )}
    </>
  );
}

function Row({ profile, periods }: { profile: Profile; periods: PeriodRec[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pinned, unlocked, pinState } = useLock();
  const locked = Boolean(pinned[profile.id] && !unlocked[profile.id]);
  const actions = usePeriodActions(profile.id, periods);
  const today = localToday();
  const resetAt = pinState[profile.id]?.resetAt;
  const [pickStart, setPickStart] = useState(false);

  if (locked) {
    return (
      <li>
        <button type="button" onClick={() => navigate(`/p/${profile.id}`)} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left">
          <BangleRing size={40} colour={profile.colour} model={null} locked label={t('home.locked', { name: profile.name })} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 truncate text-lg font-medium">{profile.name}<Lock aria-hidden className="size-4 text-ink-2" /></span>
            {resetAt ? <span className="text-sm text-ink-2">{t('pin.resetPending', { when: formatDateTime(resetAt) })}</span> : null}
          </span>
        </button>
      </li>
    );
  }

  const ps = toEnginePeriods(periods);
  const st = statusOf(profile, ps, today);
  const model = ringModel(today, profile, ps);
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button type="button" onClick={() => navigate(`/p/${profile.id}`)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left">
        <BangleRing size={40} colour={profile.colour} model={model} label={t('home.ringLabel', { name: profile.name })} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-medium">{profile.name}</span>
          <span className="text-sm text-ink-2">{statusLine(t, profile, st, periods.length > 0)}</span>
        </span>
      </button>
      {profile.mode !== 'pregnant' && (
        <div className="flex shrink-0 items-center gap-1">
          {actions.ongoing
            ? <Button variant="secondary" className="px-4 text-[0.9375rem]" onClick={() => void actions.end()}>{t('actions.periodEnded')}</Button>
            : <Button className="px-4 text-[0.9375rem]" onClick={() => void actions.start()}>{t('actions.periodStarted')}</Button>}
          <button type="button" onClick={() => setPickStart(true)} aria-label={t('actions.startedOtherDayFor', { name: profile.name })}
            className="grid size-11 place-items-center rounded-full text-primary">
            <CalendarPlus aria-hidden className="size-5" />
          </button>
        </div>
      )}
      <StartDateSheet open={pickStart} name={profile.name} onClose={() => setPickStart(false)} onPick={d => actions.start(d)} />
      <NearbyPeriodSheet
        nearby={actions.ask?.nearby ?? null}
        onEdit={() => void actions.resolve(true)} onNew={() => void actions.resolve(false)} onClose={actions.cancelAsk}
      />
    </li>
  );
}

/** The next two weeks for every unlocked profile: periods, fertile days, due dates. */
function ComingUp({ profiles }: { profiles: Profile[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pinned, unlocked } = useLock();
  const today = localToday();
  const open = profiles.filter(p => !(pinned[p.id] && !unlocked[p.id]));
  const items = upcomingEvents(open, today);
  if (!open.length) return null;
  const when = (n: number) => (n === 0 ? t('upcoming.today') : n === 1 ? t('upcoming.tomorrow') : t('upcoming.inDays', { count: n }));
  return (
    <section className="mx-4 mt-4 rounded-2xl bg-surface p-4" aria-labelledby="coming-up">
      <h2 id="coming-up" className="mb-2 flex items-center gap-2 text-xl">
        <CalendarClock aria-hidden className="size-5 text-primary" />{t('upcoming.title')}
      </h2>
      {items.length === 0 ? <p className="text-ink-2">{t('upcoming.none')}</p> : (
        <ul className="flex flex-col divide-y divide-line">
          {items.map(i => (
            <li key={`${i.pid}-${i.kind}`}>
              <button type="button" onClick={() => navigate(`/p/${i.pid}`)} className="flex min-h-12 w-full items-center gap-3 py-2 text-left">
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: `var(--bangle-${i.colour})` }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t(`upcoming.${i.kind}`, { name: i.name })}</span>
                  <span className="block text-sm text-ink-2">{formatDate(i.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </span>
                <span className={`shrink-0 text-sm font-medium ${i.kind === 'period' ? 'text-period' : i.kind === 'fertile' ? 'text-fertile' : 'text-primary'}`}>{when(i.inDays)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 && <p className="mt-2 text-sm text-ink-2">{t('upcoming.estimate')}</p>}
    </section>
  );
}

/** A monthly nudge to save a backup, because uninstalling the app deletes everything. */
function BackupNudge({ hasData }: { hasData: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    void backupState().then(s => { if (alive) setShow(needsBackup(s, Date.now())); }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  if (!show || !hasData) return null;
  return (
    <section className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl bg-flag-tint p-4" role="status">
      <p className="flex items-start gap-2">
        <DatabaseBackup aria-hidden className="mt-0.5 size-5 shrink-0 text-flag" />
        <span>{t('backup.nudge')}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/settings')}>{t('backup.nudgeGo')}</Button>
        <Button variant="ghost" onClick={() => { setShow(false); void snoozeBackup(); }}>{t('backup.nudgeLater')}</Button>
      </div>
    </section>
  );
}
