import { useEffect, useState } from 'react';
import { Delete } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props { onComplete: (pin: string) => void | Promise<void>; error?: string | null; disabled?: boolean }

/** 4-digit PIN pad. Clears itself after each attempt. */
export function PinPad({ onComplete, error, disabled }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  const press = (d: string) => {
    if (busy || disabled || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setBusy(true);
      void Promise.resolve(onComplete(next)).finally(() => { setPin(''); setBusy(false); });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') setPin(p => p.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const key = 'grid h-14 place-items-center rounded-2xl bg-surface text-2xl font-medium text-ink transition-transform duration-150 active:scale-95 disabled:opacity-40';
  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-4">
      <div className="flex gap-4" aria-label={t('pin.entered', { count: pin.length })} role="status">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`size-4 rounded-full border-2 border-ink transition-colors duration-150 ${i < pin.length ? 'bg-ink' : ''}`} />
        ))}
      </div>
      <p className="min-h-6 text-center text-sm text-period" role="alert">{error ?? ''}</p>
      <div className="grid w-full grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button key={d} type="button" className={key} onClick={() => press(d)} disabled={disabled}>{d}</button>
        ))}
        <span />
        <button type="button" className={key} onClick={() => press('0')} disabled={disabled}>0</button>
        <button type="button" className={key} onClick={() => setPin(p => p.slice(0, -1))} aria-label={t('pin.delete')} disabled={disabled}>
          <Delete aria-hidden className="size-6" />
        </button>
      </div>
    </div>
  );
}
