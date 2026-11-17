import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import type { ISODate, TodayStatus } from '../../../shared/engine';
import type { Profile } from '../../data/types';
import { tipGroup, tipKey } from '../../lib/tips';
import type { Stage } from '../../lib/stage';

/** One short, general tip matched to where she is in her cycle (or pregnancy). */
export function TipCard({ profile, st, today, stage }: { profile: Profile; st: TodayStatus; today: ISODate; stage?: Stage }) {
  const { t } = useTranslation();
  const group = tipGroup(profile, st, today, stage);
  if (!group) return null;
  return (
    <section className="mx-4 mt-4 flex gap-3 rounded-2xl bg-surface p-4" aria-labelledby="tip-title">
      <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-flag" />
      <div className="flex flex-col gap-1">
        <h2 id="tip-title" className="font-medium">{t('tips.title')}</h2>
        <p className="text-[0.9375rem]">{t(tipKey(group, today, profile.id))}</p>
      </div>
    </section>
  );
}
