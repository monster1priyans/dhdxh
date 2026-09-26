import { Outlet } from 'react-router';
import { TabBar } from './TabBar';

export function AppShell() {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] pt-[env(safe-area-inset-top)] pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <main>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
