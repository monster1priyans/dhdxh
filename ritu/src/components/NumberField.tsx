import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  label: string;
  value: number | null;
  min: number;
  max: number;
  /** Largest number of decimals kept (0 for whole numbers). */
  decimals?: number;
  unit?: string;
  placeholder?: string;
  hint?: string;
  onChange: (v: number | null) => void;
  /** Told whenever the typed text becomes valid or invalid, so a form can block saving. */
  onValidity?: (valid: boolean) => void;
}

/** A number box that keeps what was typed, and explains the allowed range instead of silently dropping it. */
export function NumberField({ label, value, min, max, decimals = 1, unit, placeholder, hint, onChange, onValidity }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const [text, setText] = useState(value === null ? '' : String(value));
  const [error, setError] = useState(false);
  // The last value this box reported; any other value arriving means it was changed from outside (a new day)
  const sent = useRef(value);

  useEffect(() => {
    if (value === sent.current) return;
    sent.current = value;
    setText(value === null ? '' : String(value));
    setError(false);
  }, [value]);

  const emit = (v: number | null) => { sent.current = v; onChange(v); };

  function change(raw: string) {
    setText(raw);
    const s = raw.trim().replace(',', '.');
    if (s === '') { setError(false); onValidity?.(true); emit(null); return; }
    const n = Number(s);
    const ok = Number.isFinite(n) && n >= min && n <= max;
    setError(!ok);
    onValidity?.(ok);
    if (ok) emit(Number(n.toFixed(decimals)));
  }

  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="font-medium">{label}</label>
        <div className="ml-auto flex items-center gap-2">
          <input
            id={id} type="text" inputMode="decimal" autoComplete="off"
            value={text} placeholder={placeholder}
            onChange={e => change(e.target.value)}
            aria-invalid={error || undefined} aria-describedby={describedBy}
            className={`min-h-11 w-24 rounded-xl border bg-surface px-3 text-right ${error ? 'border-period' : 'border-line'}`}
          />
          {unit && <span className="min-w-8 text-sm text-ink-2">{unit}</span>}
        </div>
      </div>
      {hint && <p id={`${id}-hint`} className="text-sm text-ink-2">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-sm text-period">{t('log.rangeError', { min, max })}</p>}
    </div>
  );
}
