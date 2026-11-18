import type { ReactNode } from 'react';

export function ScreenHeader({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <header className="px-4 pb-2 pt-4">
      {sub && <p className="text-sm font-medium text-ink-2">{sub}</p>}
      <h1 className="text-[1.625rem] text-ink">{title}</h1>
    </header>
  );
}
