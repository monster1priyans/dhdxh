import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Icon aria-hidden className="size-10 text-ink-2" strokeWidth={1.5} />
      <p className="text-lg font-medium text-ink">{title}</p>
      {children && <div className="text-ink-2">{children}</div>}
    </div>
  );
}
