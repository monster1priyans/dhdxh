import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BarChart3, CalendarDays, House, Settings, Users, type LucideIcon } from 'lucide-react';

const TABS: { to: string; key: string; icon: LucideIcon }[] = [
  { to: '/', key: 'home', icon: House },
  { to: '/calendar', key: 'calendar', icon: CalendarDays },
  { to: '/insights', key: 'insights', icon: BarChart3 },
  { to: '/circle', key: 'circle', icon: Users },
  { to: '/settings', key: 'settings', icon: Settings },
];

export function TabBar() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('tabs.label')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[480px]">
        {TABS.map(({ to, key, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-ink-2'
                }`}
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden className="size-6" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="leading-tight">{t(`tabs.${key}`)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
