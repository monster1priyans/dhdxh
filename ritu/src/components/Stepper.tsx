import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }

export function Stepper({ label, value, min, max, onChange, unit }: Props) {
  const { t } = useTranslation();
  const btn = 'grid size-11 place-items-center rounded-full border border-line bg-surface text-ink transition-transform duration-150 active:scale-95 disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <span className="font-medium">{label}</span>
      <div className="ml-auto flex items-center gap-1" role="group" aria-label={label}>
        <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={t('common.decrease')}>
          <Minus aria-hidden className="size-4" />
        </button>
        <output className="flex min-w-10 flex-col items-center leading-tight" aria-live="polite">
          <span className="text-lg font-medium">{value}</span>
          {unit && <span className="text-xs text-ink-2">{unit}</span>}
        </output>
        <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={t('common.increase')}>
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
