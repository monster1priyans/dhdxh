import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Lock } from 'lucide-react';
import { localToday, type Flow, type ISODate } from '../../../shared/engine';
import { applyPeriodOp } from '../../data/actions';
import { emptyLog, emptyPrivate, getLog, getPrivate, saveLog, savePrivate } from '../../data/logs';
import { MOODS, SYMPTOMS, type LogRec, type PeriodRec, type PrivateRec, type Profile } from '../../data/types';
import { periodCovering, periodOff, periodOn, stretchTo, type PeriodLike } from '../../lib/periodRules';
import { formatLongDate } from '../../lib/format';
import { toast } from '../../store/toast';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Switch } from '../../components/Switch';
import { NearbyPeriodSheet } from './NearbyPeriodSheet';
import { MOOD_ICONS, SYMPTOM_ICONS } from './icons';

export const FLOWS: Flow[] = ['spotting', 'light', 'medium', 'heavy', 'very_heavy'];

interface Props { profile: Profile; periods: PeriodRec[]; date: ISODate | null; onClose: () => void }

export function LogSheet({ profile, periods, date, onClose }: Props) {
  const { t } = useTranslation();
  const today = localToday();
  const [log, setLog] = useState<LogRec | null>(null);
  const [priv, setPriv] = useState<PrivateRec | null>(null);
  const [periodOnDay, setPeriodOnDay] = useState(false);
  const [nearby, setNearby] = useState<PeriodLike | null>(null);
  const [saving, setSaving] = useState(false);
  const showPrivate = !profile.isManaged;
  const ttc = profile.mode === 'ttc';

  useEffect(() => {
    if (!date) return;
    let alive = true;
    void (async () => {
      const [l, p] = await Promise.all([getLog(profile.id, date), showPrivate ? getPrivate(profile.id, date) : undefined]);
      if (!alive) return;
      setLog(l ?? emptyLog(profile.id, date));
      setPriv(p ?? emptyPrivate(profile.id, date));
      setPeriodOnDay(Boolean(periodCovering(periods, date, today)));
    })();
    return () => { alive = false; };
    // periods are read once per opening
  }, [date, profile.id, showPrivate]);

  if (!date) return null;
  const set = (patch: Partial<LogRec>) => setLog(l => (l ? { ...l, ...patch } : l));
  const setP = (patch: Partial<PrivateRec>) => setPriv(p => (p ? { ...p, ...patch } : p));

  async function save(resolveNearby?: 'edit' | 'new') {
    if (!date || !log) return;
    setSaving(true);
    const wasOn = Boolean(periodCovering(periods, date, today));
    if (periodOnDay !== wasOn) {
      if (periodOnDay) {
        const r = periodOn(periods, date, today);
        if (r.nearby && !resolveNearby) { setNearby(r.nearby); setSaving(false); return; }
        const op = r.nearby && resolveNearby === 'edit' ? stretchTo(r.nearby, date, today) : r.op;
        await applyPeriodOp(profile.id, op);
      } else {
        await applyPeriodOp(profile.id, periodOff(periods, date, today));
      }
    }
    await saveLog(log);
    if (showPrivate && priv) await savePrivate(priv);
    setNearby(null);
    setSaving(false);
    toast(t('toast.saved'));
    onClose();
  }

  return (
    <>
      <BottomSheet
        open={date !== null && nearby === null} onClose={onClose} title={formatLongDate(date)}
        footer={<Button className="w-full" disabled={!log || saving} onClick={() => void save()}>{t('common.save')}</Button>}
      >
        {log && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-line p-3">
              <Switch label={t('log.period')} checked={periodOnDay} onChange={setPeriodOnDay} hint={t('log.periodHint')} />
            </div>

            <Section title={t('log.flow')} hint={t('log.flowHint')}>
              {FLOWS.map(f => (
                <Chip key={f} tone="period" label={t(`flow.${f}`)} selected={log.flow === f} onToggle={() => set({ flow: log.flow === f ? null : f })} />
              ))}
            </Section>

            <Section title={t('log.symptoms')}>
              {SYMPTOMS.map(s => (
                <Chip key={s} icon={SYMPTOM_ICONS[s]} label={t(`symptom.${s}`)} selected={log.symptoms.includes(s)}
                  onToggle={() => set({ symptoms: log.symptoms.includes(s) ? log.symptoms.filter(x => x !== s) : [...log.symptoms, s] })} />
              ))}
            </Section>

            <Section title={t('log.mood')}>
              {MOODS.map(m => (
                <Chip key={m} icon={MOOD_ICONS[m]} label={t(`mood.${m}`)} selected={log.mood === m} onToggle={() => set({ mood: log.mood === m ? null : m })} />
              ))}
            </Section>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="pain" className="font-medium">{t('log.pain')}</label>
                <span className="text-ink-2">{log.pain === null ? t('log.notLogged') : t('log.painValue', { value: log.pain })}</span>
              </div>
              <input
                id="pain" type="range" min={0} max={10} step={1} value={log.pain ?? 0}
                onChange={e => set({ pain: Number(e.target.value) })}
                className="h-11 w-full accent-[var(--primary)]"
                aria-valuetext={log.pain === null ? t('log.notLogged') : t('log.painValue', { value: log.pain })}
              />
              <div className="flex justify-between text-sm text-ink-2">
                <span>{t('log.painNone')}</span>
                {log.pain !== null && <button type="button" className="min-h-11 px-2 text-primary" onClick={() => set({ pain: null })}>{t('log.clear')}</button>}
                <span>{t('log.painWorst')}</span>
              </div>
            </div>

            {ttc && (
              <div className="flex flex-col gap-4 rounded-2xl border border-line p-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="font-medium">{t('log.bbt')}</span>
                  <input
                    type="number" inputMode="decimal" min={35} max={38} step={0.01}
                    value={log.bbt ?? ''} placeholder="36.50"
                    onChange={e => {
                      const v = e.target.value === '' ? null : Number(e.target.value);
                      set({ bbt: v !== null && v >= 35 && v <= 38 ? v : v === null ? null : log.bbt });
                    }}
                    className="min-h-11 w-28 rounded-xl border border-line bg-surface px-3 text-right"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto font-medium">{t('log.lh')}</span>
                  <Chip label={t('log.positive')} selected={log.lhTest === 'positive'} onToggle={() => set({ lhTest: log.lhTest === 'positive' ? null : 'positive' })} />
                  <Chip label={t('log.negative')} selected={log.lhTest === 'negative'} onToggle={() => set({ lhTest: log.lhTest === 'negative' ? null : 'negative' })} />
                </div>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="font-medium">{t('log.notes')}</span>
              <textarea
                value={log.notes} onChange={e => set({ notes: e.target.value.slice(0, 1000) })} rows={3}
                className="rounded-xl border border-line bg-surface p-3"
              />
            </label>

            {showPrivate && priv && (
              <details className="group rounded-2xl border border-line">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 font-medium">
                  <Lock aria-hidden className="size-4 text-ink-2" />
                  {t('log.private')}
                  <ChevronDown aria-hidden className="ml-auto size-5 transition-transform duration-150 group-open:rotate-180" />
                </summary>
                <div className="flex flex-col gap-4 px-3 pb-3">
                  <p className="text-sm text-ink-2">{t('log.privateHint')}</p>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium">{t('log.intimacy')}</span>
                    <div className="flex flex-wrap gap-2">
                      {(['none', 'protected', 'unprotected'] as const).map(v => (
                        <Chip key={v} label={t(`log.intimacy_${v}`)} selected={priv.intimacy === v} onToggle={() => setP({ intimacy: priv.intimacy === v ? null : v })} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium">{t('log.pregnancyTest')}</span>
                    <div className="flex flex-wrap gap-2">
                      {(['positive', 'negative'] as const).map(v => (
                        <Chip key={v} label={t(`log.${v}`)} selected={priv.pregnancyTest === v} onToggle={() => setP({ pregnancyTest: priv.pregnancyTest === v ? null : v })} />
                      ))}
                    </div>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-medium">{t('log.privateNote')}</span>
                    <textarea value={priv.note} onChange={e => setP({ note: e.target.value.slice(0, 1000) })} rows={2}
                      className="rounded-xl border border-line bg-surface p-3" />
                  </label>
                </div>
              </details>
            )}
          </div>
        )}
      </BottomSheet>
      <NearbyPeriodSheet
        nearby={nearby}
        onEdit={() => void save('edit')}
        onNew={() => void save('new')}
        onClose={() => setNearby(null)}
      />
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-medium">{title}</legend>
      {hint && <p className="-mt-1 text-sm text-ink-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
