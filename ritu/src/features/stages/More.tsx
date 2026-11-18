import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** A section that opens on tap, so stage cards stay short. */
export function More({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 font-medium">
        {title}
        <ChevronDown aria-hidden className="ml-auto size-5 transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 text-[0.9375rem] text-ink-2">{children}</div>
    </details>
  );
}

export function Bullets({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`ml-5 flex list-disc flex-col gap-1 ${className}`}>
      {items.map(i => <li key={i}>{i}</li>)}
    </ul>
  );
}
