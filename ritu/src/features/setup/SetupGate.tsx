import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Loader2, Settings2, WifiOff, type LucideIcon } from 'lucide-react';
import { useSession } from '../../store/session';

function Message({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 px-6 text-center">
      <Icon aria-hidden className="size-12 text-primary" strokeWidth={1.5} />
      <h1 className="text-2xl text-ink">{title}</h1>
      <p className="text-ink-2">{body}</p>
      {action}
    </main>
  );
}

/** Blocks the app until the (anonymous) user exists. After first launch this resolves offline. */
export function SetupGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { status, start, retry } = useSession();
  useEffect(() => start(), [start]);

  const retryButton = (
    <button
      type="button"
      onClick={retry}
      className="min-h-11 rounded-full bg-primary px-6 font-medium text-on-primary transition-transform duration-150 active:scale-95"
    >
      {t('setup.tryAgain')}
    </button>
  );

  switch (status) {
    case 'ready':
      return <>{children}</>;
    case 'needs_network':
      return <Message icon={WifiOff} title={t('setup.needsNetworkTitle')} body={t('setup.needsNetworkBody')} action={retryButton} />;
    case 'error':
      return <Message icon={CircleAlert} title={t('setup.errorTitle')} body={t('setup.errorBody')} action={retryButton} />;
    case 'not_configured':
      return <Message icon={Settings2} title={t('setup.notConfiguredTitle')} body={t('setup.notConfiguredBody')} />;
    default:
      return (
        <main className="flex min-h-dvh items-center justify-center" aria-busy="true">
          <Loader2 aria-hidden className="size-8 animate-spin text-primary motion-reduce:animate-none" />
          <span className="sr-only">{t('setup.loading')}</span>
        </main>
      );
  }
}
