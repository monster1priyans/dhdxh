import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff } from 'lucide-react';

export function OfflineBanner() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-surface px-4 py-2 text-sm text-ink-2 border-b border-line">
      <CloudOff aria-hidden className="size-4 shrink-0" />
      {t('offline')}
    </div>
  );
}
