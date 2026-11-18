import { useTranslation } from 'react-i18next';
import { useLock } from '../store/lock';
import type { Profile } from '../data/types';
import { ProfileDot } from './ProfileDot';

/** Row of profile chips to choose whose calendar/insights to show. */
export function ProfilePicker({ profiles, value, onChange }: { profiles: Profile[]; value: string | null; onChange: (pid: string) => void }) {
  const { t } = useTranslation();
  const { pinned, unlocked } = useLock();
  if (profiles.length < 2) return null;
  return (
    <div role="radiogroup" aria-label={t('common.chooseProfile')} className="flex flex-wrap gap-2 px-4 pb-3">
      {profiles.map(p => {
        const locked = Boolean(pinned[p.id] && !unlocked[p.id]);
        const on = p.id === value;
        return (
          <button
            key={p.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(p.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 transition-colors duration-150 ${on ? 'border-ink bg-surface font-medium' : 'border-line text-ink-2'}`}
          >
            <ProfileDot colour={p.colour} locked={locked} />
            <span className="max-w-32 truncate">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
