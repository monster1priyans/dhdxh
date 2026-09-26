import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Loader2 } from 'lucide-react';
import { getDb, requestPersistentStorage } from '../../data/db';

/** Opens the on-device database before showing the app. No account, no network. */
export function SetupGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    getDb()
      .then(() => { setState('ready'); void requestPersistentStorage(); })
      .catch(() => setState('error'));
  }, []);

  if (state === 'ready') return <>{children}</>;
  if (state === 'error') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 px-6 text-center">
        <CircleAlert aria-hidden className="size-12 text-primary" strokeWidth={1.5} />
        <h1 className="text-2xl text-ink">{t('setup.storageTitle')}</h1>
        <p className="text-ink-2">{t('setup.storageBody')}</p>
      </main>
    );
  }
  return (
    <main className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <Loader2 aria-hidden className="size-8 animate-spin text-primary motion-reduce:animate-none" />
      <span className="sr-only">{t('setup.loading')}</span>
    </main>
  );
}
