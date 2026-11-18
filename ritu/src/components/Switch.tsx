import { useId, type ReactNode } from 'react';

interface Props { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode; disabled?: boolean }

export function Switch({ label, checked, onChange, hint, disabled }: Props) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <label htmlFor={id} className="flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-sm text-ink-2">{hint}</span>}
      </label>
      <button
        id={id} type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-150 disabled:opacity-50 before:absolute before:-inset-2 before:content-[''] ${checked ? 'bg-primary' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-surface shadow transition-transform duration-150 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
