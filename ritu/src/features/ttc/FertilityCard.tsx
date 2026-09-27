import { useTranslation } from 'react-i18next';
import { Sprout } from 'lucide-react';
import { addDays, dayInfo, diffDays, type ISODate, type Period } from '../../../shared/engine';
import type { LogRec, Profile } from '../../data/types';
import { formatDate } from '../../lib/format';
import { cycleTemps, detectShift } from '../../lib/temp';
import { TempChart } from '../../components/TempChart';

/** Trying-to-conceive mode: today's chance, the LH and temperature signals, and the temperature chart. */
export function FertilityCard({ profile, periods, logs, today }: { profile: Profile; periods: Period[]; logs: LogRec[]; today: ISODate }) {
  const { t } = useTranslation();
  const pred = profile.prediction;
  const info = dayInfo(today, today, periods, pred, profile.settings.lutealLen);
  const level = !profile.showFertility || !periods.length ? null : info.ovulation ? 'peak' : info.fertile ? 'high' : 'low';
  const next = pred?.cycles.find(c => c.fertileStart > today);
  const temps = cycleTemps(periods, logs, today);
  const shift = detectShift(temps.points);
  const recentLh = logs.some(l => l.lhTest === 'positive' && (l.date === today || l.date === addDays(today, -1)));

  const tone = level === 'peak' || level === 'high' ? 'bg-fertile-tint' : 'bg-bg';
  return (
    <section className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl bg-surface p-4" aria-labelledby="ttc-title">
      <h2 id="ttc-title" className="flex items-center gap-2 text-xl">
        <Sprout aria-hidden className="size-5 text-fertile" />{t('ttc.title')}
      </h2>
      {level ? (
        <div className={`rounded-xl p-3 ${tone}`}>
          <p className="text-lg font-medium">{t(`ttc.level_${level}`)}</p>
          <p className="text-sm text-ink-2">{t(`ttc.levelHint_${level}`)}</p>
          {level === 'low' && next && (
            <p className="mt-1 text-sm">{t('ttc.nextWindow', { count: diffDays(next.fertileStart, today), date: formatDate(next.fertileStart) })}</p>
          )}
        </div>
      ) : (
        <p className="text-ink-2">{periods.length ? t('ttc.fertilityOff') : t('ttc.noPeriods')}</p>
      )}
      {recentLh && <p className="text-[0.9375rem]">{t('ttc.lhPositive')}</p>}
      {shift && <p className="text-[0.9375rem]">{t('ttc.shift', { date: formatDate(shift.date) })}</p>}

      <h3 className="mt-1 font-medium">{t('ttc.chartTitle')}</h3>
      {temps.points.length >= 2
        ? <TempChart points={temps.points} lhDays={temps.lhDays} shift={shift} cycleLen={profile.settings.cycleLen} />
        : <p className="text-sm text-ink-2">{t('ttc.chartEmpty')}</p>}
      <p className="text-sm text-ink-2">{t('ttc.note')}</p>
    </section>
  );
}
