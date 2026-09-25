import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import type { Profile } from '../data/types';
import { useIsLocked, useLock } from '../store/lock';
import { formatDateTime } from '../lib/format';
import { PinPad } from './PinPad';
import { Button } from './Button';

/** Shows only name + lock until the right PIN is entered. */
export function PinGate({ profile, children }: { profile: Profile; children: ReactNode }) {
  const locked = useIsLocked(profile.id);
  if (!locked) return <>{children}</>;
  return <Unlock profile={profile} />;
}

function Unlock({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const { tryUnlock, forgotPin, pinState } = useLock();
  const st = pinState[profile.id];
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const lockedOut = (st?.lockedUntil ?? 0) > now;

  useEffect(() => {
    if (!lockedOut) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedOut]);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-8">
      <Lock aria-hidden className="size-8 text-ink-2" />
      <h1 className="text-2xl">{profile.name}</h1>
      <p className="text-ink-2">{t('pin.enter')}</p>
      <PinPad
        disabled={lockedOut}
        error={lockedOut ? t('pin.lockedOut', { count: Math.ceil(((st?.lockedUntil ?? 0) - now) / 1000) }) : error}
        onComplete={async pin => {
          const r = await tryUnlock(profile.id, pin);
          setNow(Date.now());
          if (r.kind === 'wrong') setError(t('pin.wrong', { count: r.triesLeft }));
          else setError(null);
        }}
      />
      {st?.resetAt ? (
        <p className="text-center text-sm text-ink-2">{t('pin.resetPending', { when: formatDateTime(st.resetAt) })}</p>
      ) : (
        <Button variant="ghost" onClick={() => void forgotPin(profile.id)}>{t('pin.forgot')}</Button>
      )}
    </div>
  );
}
