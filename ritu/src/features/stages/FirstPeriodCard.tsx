import { useTranslation } from 'react-i18next';
import { CircleAlert, Sparkles } from 'lucide-react';
import { ageOf } from '../../data/actions';
import type { Profile } from '../../data/types';
import { Bullets, More } from './More';
import { DOCTOR, KIT, SIGNS, TALK } from './content';


/** Before a daughter's first period: the signs to watch for, a kit for school, and how to talk about it. */
export function FirstPeriodCard({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const age = ageOf(profile);
  return (
    <section className="mx-4 mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-4" aria-labelledby="first-title">
      <h2 id="first-title" className="flex items-center gap-2 text-xl">
        <Sparkles aria-hidden className="size-5 text-primary" />{t('first.title')}
      </h2>
      <p>{t('first.intro')}</p>
      {age !== null && age >= 15 && (
        <p className="flex items-start gap-2 rounded-xl bg-flag-tint p-3" role="note">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-flag" />
          <span>{t('first.age15', { age })}</span>
        </p>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">{t('first.signsTitle')}</h3>
        <Bullets className="text-[0.9375rem]" items={SIGNS.map(k => t(`first.sign_${k}`))} />
      </div>
      <More title={t('first.kitTitle')}><Bullets items={KIT.map(k => t(`first.kit_${k}`))} /></More>
      <More title={t('first.talkTitle')}><Bullets items={TALK.map(k => t(`first.talk_${k}`))} /></More>
      <More title={t('first.doctorTitle')}><Bullets items={DOCTOR.map(k => t(`first.doctor_${k}`))} /></More>
    </section>
  );
}
