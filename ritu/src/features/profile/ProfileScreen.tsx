import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CircleAlert, Lock, PauseCircle, Plus, Settings } from 'lucide-react';
import { diffDays, healthFlags, localToday, type ISODate } from '../../../shared/engine';
import { ageOf, applyPeriodOp } from '../../data/actions';
import { emptyLog, saveLog } from '../../data/logs';
import { toEnginePeriods } from '../../data/periods';
import { MOODS, SYMPTOMS, type LogRec, type Symptom } from '../../data/types';
import { useProfileData } from '../../hooks/useProfileData';
import { ringModel, statusLine, statusOf } from '../../lib/cycle';
import { formatDate } from '../../lib/format';
import { useProfile } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { usePrefs } from '../../store/prefs';
import { toast } from '../../store/toast';
import { BangleRing } from '../../components/BangleRing';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { PinGate } from '../../components/PinGate';
import { FLOWS, LogSheet } from '../log/LogSheet';
import { MOOD_ICONS, SYMPTOM_ICONS } from '../log/icons';
import { NearbyPeriodSheet } from '../log/NearbyPeriodSheet';
import { usePeriodActions } from '../log/usePeriodActions';

export function ProfileScreen() {
  const { pid } = useParams();
  const profile = useProfile(pid);
  const { t } = useTranslation();
  if (!profile) {
    return <p className="p-6 text-center text-ink-2">{t('profile.notFound')} <Link className="text-primary" to="/">{t('tabs.home')}</Link></p>;
  }
  return <PinGate profile={profile}><Today pid={profile.id} /></PinGate>;
}

function Today({ pid }: { pid: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useProfile(pid)!;
  const { periods, logs, loaded } = useProfileData(pid);
  const pinned = useLock(s => Boolean(s.pinned[pid]));
  const lock = useLock(s => s.lock);
  const setActive = usePrefs(s => s.setActive);
  const actions = usePeriodActions(pid, periods);
  const [logDate, setLogDate] = useState<ISODate | null>(null);
  const [endAsk, setEndAsk] = useState(false);
  const today = localToday();

  const ps = useMemo(() => toEnginePeriods(periods), [periods]);
  const st = statusOf(profile, ps, today);
  const model = ringModel(today, profile, ps);
  const todayLog: LogRec = logs.find(l => l.date === today) ?? emptyLog(pid, today);
  const pred = profile.mode === 'pregnant' ? null : profile.prediction;
  const flags = healthFlags({ today, periods: ps, logs, pred: profile.prediction, age: ageOf(profile), mode: profile.mode });
  const doctorFlags = flags.filter(f => f.level === 'doctor');
  const longOngoing = actions.ongoing && diffDays(today, actions.ongoing.startDate) >= 9;

  // her 6 most-logged symptoms first
  const topSymptoms = useMemo(() => {
    const count = new Map<Symptom, number>();
    logs.forEach(l => l.symptoms.forEach(s => count.set(s, (count.get(s) ?? 0) + 1)));
    return [...SYMPTOMS].sort((a, b) => (count.get(b) ?? 0) - (count.get(a) ?? 0)).slice(0, 6);
  }, [logs]);

  async function quick(patch: Partial<LogRec>) {
    await saveLog({ ...todayLog, ...patch });
    toast(t('toast.saved'));
  }

  const dayLabel = st.cycleDay !== null ? t('today.day', { day: st.cycleDay }) : null;

  return (
    <div className="pb-6">
      <header className="flex items-center gap-1 px-2 pt-2">
        <button type="button" onClick={() => navigate('/')} className="grid size-11 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="flex-1 truncate text-2xl">{profile.name}</h1>
        {pinned && (
          <button type="button" onClick={() => { lock(pid); navigate('/'); }} className="grid size-11 place-items-center rounded-full" aria-label={t('pin.lockNow')}>
            <Lock aria-hidden className="size-5" />
          </button>
        )}
        <Link to={`/p/${pid}/settings`} className="grid size-11 place-items-center rounded-full" aria-label={t('profile.settings')}>
          <Settings aria-hidden className="size-5" />
        </Link>
      </header>

      <section className="flex flex-col items-center gap-4 px-4 pt-4">
        <BangleRing size={260} colour={profile.colour} model={model} animate={loaded} label={statusLine(t, profile, st, periods.length > 0)}>
          {profile.mode === 'pregnant' ? (
            <>
              <PauseCircle aria-hidden className="size-10 text-ink-2" />
              <span className="mt-1 max-w-40 text-lg font-medium">{t('status.paused')}</span>
            </>
          ) : (
            <>
              {dayLabel && <span className="font-display text-[3.5rem] leading-none font-semibold">{dayLabel}</span>}
              {st.phase !== 'unknown' && <span className="mt-1 text-lg font-medium">{t(`phase.${st.phase}`)}</span>}
              <span className="max-w-40 text-[0.9375rem] text-ink-2">{statusLine(t, profile, st, periods.length > 0)}</span>
            </>
          )}
        </BangleRing>

        {profile.mode !== 'pregnant' && (
          actions.ongoing
            ? <Button variant="secondary" onClick={() => void actions.end()}>{t('actions.periodEnded')}</Button>
            : <Button onClick={() => void actions.start()}>{t('actions.periodStarted')}</Button>
        )}
      </section>

      {longOngoing && (
        <Banner tone="info" text={t('today.stillOn')}>
          <Button variant="secondary" onClick={() => setEndAsk(true)}>{t('today.setEnd')}</Button>
        </Banner>
      )}
      {doctorFlags.length > 0 && (
        <Banner tone="flag" text={t('today.flagBanner')}>
          <Button variant="secondary" onClick={() => { setActive(pid); navigate('/insights'); }}>{t('today.seeInsights')}</Button>
        </Banner>
      )}

      <section className="mx-4 mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-4">
        <h2 className="text-xl">{t('today.quickLog')}</h2>
        <QuickRow label={t('log.flow')}>
          {FLOWS.map(f => <Chip key={f} tone="period" label={t(`flow.${f}`)} selected={todayLog.flow === f} onToggle={() => void quick({ flow: todayLog.flow === f ? null : f })} />)}
        </QuickRow>
        <QuickRow label={t('log.symptoms')}>
          {topSymptoms.map(s => (
            <Chip key={s} icon={SYMPTOM_ICONS[s]} label={t(`symptom.${s}`)} selected={todayLog.symptoms.includes(s)}
              onToggle={() => void quick({ symptoms: todayLog.symptoms.includes(s) ? todayLog.symptoms.filter(x => x !== s) : [...todayLog.symptoms, s] })} />
          ))}
        </QuickRow>
        <QuickRow label={t('log.mood')}>
          {MOODS.map(m => <Chip key={m} icon={MOOD_ICONS[m]} label={t(`mood.${m}`)} selected={todayLog.mood === m} onToggle={() => void quick({ mood: todayLog.mood === m ? null : m })} />)}
        </QuickRow>
        <Button variant="secondary" onClick={() => setLogDate(today)} className="self-start">
          <Plus aria-hidden className="size-4" />{t('today.logMore')}
        </Button>
      </section>

      {pred && (
        <section className="mx-4 mt-4 rounded-2xl bg-surface p-4">
          <h2 className="mb-3 text-xl">{t('today.nextPeriods')}</h2>
          <ul className="flex flex-col divide-y divide-line">
            {pred.cycles.map((c, k) => (
              <li key={c.start} className="flex flex-col gap-0.5 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-medium">{formatDate(c.start, { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                  <span className="text-sm text-ink-2">{t('today.plusMinus', { count: diffDays(c.rangeEnd, c.start) })}</span>
                </div>
                {profile.showFertility && (
                  <span className="text-sm text-fertile">{t('today.fertileWindow', { from: formatDate(c.fertileStart), to: formatDate(c.fertileEnd) })}</span>
                )}
                {k === 0 && <span className="text-sm text-ink-2">{t(`confidence.${pred.confidence}`, { count: pred.basedOn })}</span>}
              </li>
            ))}
          </ul>
          {profile.showFertility && <p className="mt-2 text-sm text-ink-2">{t('disclaimer')}</p>}
        </section>
      )}

      <LogSheet profile={profile} periods={periods} date={logDate} onClose={() => setLogDate(null)} />
      <NearbyPeriodSheet nearby={actions.ask?.nearby ?? null} onEdit={() => void actions.resolve(true)} onNew={() => void actions.resolve(false)} onClose={actions.cancelAsk} />
      {actions.ongoing && (
        <EndDateSheet
          open={endAsk} start={actions.ongoing.startDate} onClose={() => setEndAsk(false)}
          onSave={async end => {
            await applyPeriodOp(pid, { type: 'update', id: actions.ongoing!.id, endDate: end });
            setEndAsk(false);
            toast(t('toast.saved'));
          }}
        />
      )}
    </div>
  );
}

function QuickRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Banner({ tone, text, children }: { tone: 'flag' | 'info'; text: string; children: ReactNode }) {
  return (
    <div className={`mx-4 mt-4 flex flex-col gap-3 rounded-2xl p-4 ${tone === 'flag' ? 'bg-flag-tint' : 'bg-surface'}`} role="status">
      <p className="flex items-start gap-2">
        <CircleAlert aria-hidden className={`mt-0.5 size-5 shrink-0 ${tone === 'flag' ? 'text-flag' : 'text-primary'}`} />
        <span>{text}</span>
      </p>
      <div>{children}</div>
    </div>
  );
}

function EndDateSheet({ open, start, onClose, onSave }: { open: boolean; start: ISODate; onClose: () => void; onSave: (d: ISODate) => Promise<void> }) {
  const { t } = useTranslation();
  const today = localToday();
  const [d, setD] = useState<ISODate>(today);
  const valid = d >= start && d <= today;
  return (
    <BottomSheet open={open} onClose={onClose} title={t('today.setEnd')}
      footer={<Button className="w-full" disabled={!valid} onClick={() => void onSave(d)}>{t('common.save')}</Button>}>
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">{t('today.lastDay')}</span>
        <input type="date" min={start} max={today} value={d} onChange={e => setD(e.target.value)} className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg" />
      </label>
    </BottomSheet>
  );
}
