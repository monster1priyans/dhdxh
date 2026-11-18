import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Check, CircleAlert, Heart } from 'lucide-react';
import type { Profile } from '../../data/types';
import { formatDate } from '../../lib/format';
import type { Stage } from '../../lib/stage';
import { Button } from '../../components/Button';
import { EndPregnancySheet } from './EndPregnancySheet';
import { Bullets, More } from './More';
import { POSTNATAL, URGENT_BIRTH, URGENT_LOSS } from './content';


type AfterStage = Extract<Stage, { kind: 'after_birth' | 'after_loss' }>;

/** The weeks after a pregnancy: what is normal, what needs a doctor at once, and when periods come back. */
export function AfterPregnancyCard({ profile, stage }: { profile: Profile; stage: AfterStage }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const end = profile.pregnancyEnd;
  if (!end) return null;
  const birth = stage.kind === 'after_birth';
  const date = formatDate(end.date, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="mx-4 mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-4" aria-labelledby="after-title">
      <h2 id="after-title" className="flex items-center gap-2 text-xl">
        {birth ? <Baby aria-hidden className="size-5 text-primary" /> : <Heart aria-hidden className="size-5 text-primary" />}
        {birth ? t('after.birthTitle') : t('after.lossTitle')}
      </h2>

      {birth ? (
        <div>
          <p className="font-display text-3xl font-semibold">{t('pregnancy.weeksDays', { weeks: Math.floor(stage.days / 7), days: stage.days % 7 })}</p>
          <p className="text-ink-2">{t('after.sinceBirth', { date })}</p>
        </div>
      ) : (
        <div>
          <p className="text-lg font-medium">{t('after.lossOn', { date })}</p>
          <p className="text-ink-2">{t('after.lossCare')}</p>
        </div>
      )}

      <p>{birth && stage.kind === 'after_birth' && stage.periodsBack ? t('after.periodsBack') : birth ? t('after.waitingBirth') : t('after.waitingLoss')}</p>

      {birth && stage.kind === 'after_birth' && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{t('after.checkups')}</h3>
          <ul className="flex flex-col divide-y divide-line">
            {POSTNATAL.map(c => {
              const state = stage.days > c.to ? 'past' : stage.days >= c.from ? 'now' : 'later';
              return (
                <li key={c.id} className={`flex items-start gap-3 py-2 ${state === 'past' ? 'text-ink-2' : ''}`}>
                  <span aria-hidden className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${state === 'now' ? 'border-primary bg-primary text-on-primary' : 'border-line'}`}>
                    {state === 'past' && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">{t(`after.checkup_${c.id}`)}</span>
                    {state === 'now' && <strong className="text-sm font-medium text-primary">{t('pregnancy.now')}</strong>}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-ink-2">{t('after.checkupNote')}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl bg-flag-tint p-3" role="note">
        <p className="flex items-center gap-2 font-medium">
          <CircleAlert aria-hidden className="size-5 shrink-0 text-flag" />{t('after.urgentTitle')}
        </p>
        <Bullets className="ml-7 text-[0.9375rem]" items={(birth ? URGENT_BIRTH : URGENT_LOSS).map(k => t(`after.urgent_${k}`))} />
      </div>

      {birth ? (
        <>
          <More title={t('after.lochiaTitle')}>{t('after.lochiaBody')}</More>
          <More title={t('after.periodsTitle')}>
            <p>{t('after.periodsBody')}</p>
            <p className="mt-2">{t('after.familyPlanning')}</p>
          </More>
          <More title={t('after.feelingsTitle')}>
            <p>{t('after.feelingsBirth')}</p>
            <p className="mt-2 font-medium">{t('after.helpline')}</p>
          </More>
        </>
      ) : (
        <>
          <More title={t('after.feelingsTitle')}>
            <p>{t('after.feelingsLoss')}</p>
            <p className="mt-2 font-medium">{t('after.helpline')}</p>
          </More>
          <More title={t('after.nextTitle')}>{t('after.nextBody')}</More>
        </>
      )}

      <Button variant="secondary" className="self-start" onClick={() => setEditing(true)}>{t('after.change')}</Button>
      {editing && <EndPregnancySheet profile={profile} editing onClose={() => setEditing(false)} />}
    </section>
  );
}

