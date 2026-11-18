import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = ['what', 'where', 'share', 'pin', 'notify', 'export', 'delete', 'children', 'medical', 'contact'] as const;

export function PrivacyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[env(safe-area-inset-top)] pb-10">
      <header className="flex items-center gap-1 pt-2 pb-2">
        <button type="button" onClick={() => navigate(-1)} className="-ml-2 grid size-11 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="text-2xl">{t('policy.title')}</h1>
      </header>
      <p className="mb-4 text-ink-2">{t('policy.updated')}</p>
      {SECTIONS.map(s => (
        <section key={s} className="mb-5">
          <h2 className="mb-1 text-xl">{t(`policy.${s}.title`)}</h2>
          <p className="text-ink-2">{t(`policy.${s}.body`)}</p>
        </section>
      ))}
    </div>
  );
}
