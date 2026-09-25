import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, ChevronRight, CircleAlert, FileText, Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { healthFlags, localToday, type HealthFlag } from '../../../shared/engine';
import { ageOf } from '../../data/actions';
import { toEnginePeriods } from '../../data/periods';
import type { Profile } from '../../data/types';
import { useProfileData } from '../../hooks/useProfileData';
import { cycleBars, periodBars, symptomHeatmap, type CycleBar } from '../../lib/insights';
import { formatDate, formatNumber } from '../../lib/format';
import { useProfiles } from '../../store/profiles';
import { usePrefs } from '../../store/prefs';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PinGate } from '../../components/PinGate';
import { ProfilePicker } from '../../components/ProfilePicker';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useDoctorReport } from './useDoctorReport';

export function InsightsScreen() {
  const { t } = useTranslation();
  const profiles = useProfiles(s => s.profiles);
  const { activePid, setActive } = usePrefs();
  const active = profiles.find(p => p.id === activePid) ?? profiles[0];
  return (
    <>
      <ScreenHeader title={t('tabs.insights')} />
      {!active ? <EmptyState icon={BarChart3} title={t('insights.empty')} /> : (
        <>
          <ProfilePicker profiles={profiles} value={active.id} onChange={setActive} />
          <PinGate profile={active}><Insights key={active.id} profile={active} /></PinGate>
        </>
      )}
    </>
  );
}

function Insights({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const { periods, logs, loaded } = useProfileData(profile.id);
  const today = localToday();
  const ps = useMemo(() => toEnginePeriods(periods), [periods]);
  const pred = profile.prediction;
  const flags = healthFlags({ today, periods: ps, logs, pred, age: ageOf(profile), mode: profile.mode });
  const cycles = cycleBars(ps, pred);
  const lens = periodBars(ps);
  const heat = useMemo(() => symptomHeatmap(ps, logs, today), [ps, logs, today]);
  const [flag, setFlag] = useState<HealthFlag | null>(null);
  const report = useDoctorReport(profile);

  if (!loaded) return null;
  if (!periods.length) return <EmptyState icon={BarChart3} title={t('insights.empty')} />;

  const stat = (label: string, value: string) => (
    <div className="flex flex-col rounded-2xl bg-surface p-3">
      <span className="text-sm text-ink-2">{label}</span>
      <span className="font-display text-2xl font-semibold">{value}</span>
    </div>
  );
  const days = (n: number | null | undefined) => (n == null ? '–' : t('insights.days', { count: n, value: formatNumber(n) }));

  return (
    <div className="flex flex-col gap-4 pb-6">
      <section className="mx-4 grid grid-cols-2 gap-2" aria-label={t('insights.stats')}>
        {stat(t('insights.avgCycle'), days(pred?.avgCycle))}
        {stat(t('insights.avgPeriod'), days(pred?.avgPeriod))}
        {stat(t('insights.variation'), pred?.sd != null ? `± ${days(pred.sd)}` : '–')}
        {stat(t('insights.confidence'), pred ? t(`confidenceShort.${pred.confidence}`) : '–')}
        <p className="col-span-2 text-sm text-ink-2">{t('insights.basedOn', { count: pred?.basedOn ?? 0 })}</p>
      </section>

      {flags.length > 0 && (
        <section className="mx-4 rounded-2xl bg-surface p-4">
          <h2 className="mb-2 text-xl">{t('insights.flags')}</h2>
          <ul className="flex flex-col divide-y divide-line">
            {flags.map((f, i) => (
              <li key={`${f.type}${i}`}>
                <button type="button" onClick={() => setFlag(f)} className="flex min-h-12 w-full items-center gap-3 py-2 text-left">
                  {f.level === 'doctor'
                    ? <CircleAlert aria-hidden className="size-5 shrink-0 text-flag" />
                    : <Info aria-hidden className="size-5 shrink-0 text-primary" />}
                  <span className="flex-1">{t(`flag.${f.type}.title`, { date: f.date ? formatDate(f.date) : '' })}</span>
                  <ChevronRight aria-hidden className="size-5 text-ink-2" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Chart title={t('insights.cycleChart')} data={cycles} empty={t('insights.needTwo')} avg={pred?.avgCycle ?? null} />
      <Chart title={t('insights.periodChart')} data={lens} empty={t('insights.needEnded')} avg={pred?.avgPeriod ?? null} tone="period" />

      <section className="mx-4 rounded-2xl bg-surface p-4">
        <h2 className="text-xl">{t('insights.heatmap')}</h2>
        <p className="mb-3 text-sm text-ink-2">{t('insights.heatmapHint')}</p>
        {heat.symptoms.length === 0 ? <p className="text-ink-2">{t('insights.noSymptoms')}</p> : (
          <div className="flex flex-col gap-1">
            {heat.symptoms.map((s, r) => (
              <div key={s} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
                <span className="truncate text-sm">{t(`symptom.${s}`)}</span>
                <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${heat.days}, minmax(0, 1fr))` }}
                  role="img" aria-label={t('insights.heatRow', { symptom: t(`symptom.${s}`), days: heat.cells[r].map((v, d) => (v >= 0.5 ? d + 1 : null)).filter(Boolean).join(', ') || '–' })}>
                  {heat.cells[r].map((v, d) => (
                    <span key={d} className="h-5 rounded-[2px]" style={{ background: v ? `color-mix(in oklab, var(--primary) ${Math.round(15 + v * 85)}%, var(--surface))` : 'var(--line)' }} />
                  ))}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[5.5rem_1fr] gap-2 text-xs text-ink-2">
              <span>{t('insights.cycleDay')}</span>
              <div className="flex justify-between"><span>1</span><span>7</span><span>14</span><span>21</span><span>28</span><span>35</span></div>
            </div>
          </div>
        )}
      </section>

      <div className="mx-4">
        <Button variant="secondary" onClick={() => void report.make()} disabled={report.busy}>
          <FileText aria-hidden className="size-4" />{t('insights.report')}
        </Button>
      </div>
      <p className="mx-4 text-sm text-ink-2">{t('disclaimer')}</p>

      <BottomSheet open={flag !== null} onClose={() => setFlag(null)} title={flag ? t(`flag.${flag.type}.title`, { date: flag.date ? formatDate(flag.date) : '' }) : ''}
        footer={flag?.level === 'doctor' ? <Button className="w-full" onClick={() => void report.make()} disabled={report.busy}><FileText aria-hidden className="size-4" />{t('insights.report')}</Button> : undefined}>
        {flag && (
          <div className="flex flex-col gap-4">
            <div><h3 className="font-medium">{t('insights.noticed')}</h3><p className="text-ink-2">{t(`flag.${flag.type}.noticed`, { date: flag.date ? formatDate(flag.date) : '' })}</p></div>
            <div><h3 className="font-medium">{t('insights.why')}</h3><p className="text-ink-2">{t(`flag.${flag.type}.why`)}</p></div>
            {flag.level === 'doctor' && <p className="rounded-xl bg-flag-tint p-3">{t('insights.seeDoctor')}</p>}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function Chart({ title, data, empty, avg, tone = 'primary' }: { title: string; data: CycleBar[]; empty: string; avg: number | null; tone?: 'primary' | 'period' }) {
  const { t } = useTranslation();
  return (
    <section className="mx-4 rounded-2xl bg-surface p-4">
      <h2 className="mb-2 text-xl">{title}</h2>
      {data.length === 0 ? <p className="text-ink-2">{empty}</p> : (
        <>
          <div className="h-44" role="img" aria-label={`${title}: ${data.map(d => `${formatDate(d.start)} ${d.length}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.map(d => ({ ...d, label: formatDate(d.start, { month: 'short' }) }))} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--ink-2)', fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--ink-2)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'dataMax + 4']} />
                <Bar dataKey="length" fill={tone === 'period' ? 'var(--period)' : 'var(--primary)'} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                {avg !== null && <ReferenceLine y={avg} stroke="var(--ink)" strokeDasharray="4 4" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {avg !== null && <p className="mt-1 text-sm text-ink-2">{t('insights.avgLine', { value: formatNumber(avg) })}</p>}
        </>
      )}
    </section>
  );
}
