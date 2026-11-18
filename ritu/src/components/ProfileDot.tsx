import { Lock } from 'lucide-react';
import type { BangleColour } from '../data/types';

/** Small bangle-colour mark for a profile; grey with a lock when she is locked. */
export function ProfileDot({ colour, locked, size = 16 }: { colour: BangleColour; locked?: boolean; size?: number }) {
  if (locked) return <Lock aria-hidden className="shrink-0 text-ink-2" style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full border-[3px]"
      style={{ width: size, height: size, borderColor: `var(--bangle-${colour})` }}
    />
  );
}
