import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
  tone?: 'primary' | 'period';
}

export function Chip({ label, selected, onToggle, icon: Icon, tone = 'primary' }: Props) {
  const on = tone === 'period' ? 'border-period bg-period text-white' : 'border-primary bg-primary text-on-primary';
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[0.9375rem] transition-[transform,background-color,color] duration-150 active:scale-95 ${
        selected ? on : 'border-line bg-surface text-ink'
      }`}
    >
      {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
      {label}
    </button>
  );
}
