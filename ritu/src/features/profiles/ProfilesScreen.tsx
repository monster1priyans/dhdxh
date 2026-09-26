import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Plus, Users } from 'lucide-react';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { EmptyState } from '../../components/EmptyState';
import { ProfileDot } from '../../components/ProfileDot';
import { ScreenHeader } from '../../components/ScreenHeader';

export function ProfilesScreen() {
  const { t } = useTranslation();
  const profiles = useProfiles(s => s.profiles);
  const { pinned, unlocked } = useLock();
  return (
    <>
      <ScreenHeader title={t('tabs.profiles')} />
      {profiles.length === 0 ? <EmptyState icon={Users} title={t('profiles.empty')}>{t('profiles.emptyHint')}</EmptyState> : (
        <ul className="mx-4 divide-y divide-line overflow-hidden rounded-2xl bg-surface">
          {profiles.map(p => {
            const locked = Boolean(pinned[p.id] && !unlocked[p.id]);
            return (
              <li key={p.id}>
                <Link to={`/p/${p.id}/settings`} className="flex min-h-16 items-center gap-3 px-4 py-3">
                  <ProfileDot colour={p.colour} locked={locked} size={24} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-lg font-medium">{p.name}</span>
                    {!locked && (
                      <span className="text-sm text-ink-2">
                        {[p.isManaged ? t('profiles.managed') : t('profiles.self'), t(`mode.${p.mode}`), pinned[p.id] ? t('profiles.hasPin') : null].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                  <ChevronRight aria-hidden className="size-5 text-ink-2" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="px-4 py-4">
        <Link to="/onboarding?add=1" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-medium text-on-primary">
          <Plus aria-hidden className="size-5" />{t('home.addProfile')}
        </Link>
      </div>
      <p className="mx-4 text-sm text-ink-2">{t('privacy')}</p>
    </>
  );
}
