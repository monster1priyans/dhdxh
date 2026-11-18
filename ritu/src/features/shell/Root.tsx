import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { App } from '@capacitor/app';
import { Loader2 } from 'lucide-react';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { listenForTaps, rescheduleAll } from '../../lib/notifications';
import { isNative } from '../../lib/platform';
import { Toast } from '../../components/Toast';

const RELOCK_AFTER_MS = 60_000;

/** Loads profiles and PIN state, then wires up auto-lock, notification taps and the back button. */
export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loaded, profiles, reload } = useProfiles();
  const [lockReady, setLockReady] = useState(false);

  useEffect(() => {
    void (async () => {
      await reload();
      await useLock.getState().load(useProfiles.getState().profiles.map(p => p.id));
      setLockReady(true);
      void rescheduleAll();
    })();
  }, [reload]);

  // re-lock every profile after 60 s in the background
  useEffect(() => {
    let hiddenAt = 0;
    const away = () => { hiddenAt = Date.now(); };
    const back = () => { if (hiddenAt && Date.now() - hiddenAt >= RELOCK_AFTER_MS) useLock.getState().lockAll(); hiddenAt = 0; };
    const onVis = () => (document.hidden ? away() : back());
    document.addEventListener('visibilitychange', onVis);
    const sub = isNative() ? App.addListener('appStateChange', s => (s.isActive ? back() : away())) : null;
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      void sub?.then(h => h.remove());
    };
  }, []);

  useEffect(() => {
    listenForTaps(pid => navigate(`/p/${pid}`));
    if (!isNative()) return;
    const sub = App.addListener('backButton', ({ canGoBack }) => {
      const open = document.querySelector<HTMLDialogElement>('dialog[open]');
      if (open) open.dispatchEvent(new Event('cancel', { cancelable: true }));
      else if (canGoBack) window.history.back();
      else void App.exitApp();
    });
    return () => { void sub.then(h => h.remove()); };
  }, [navigate]);

  if (!loaded || !lockReady) {
    return (
      <main className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <Loader2 aria-hidden className="size-8 animate-spin text-primary motion-reduce:animate-none" />
      </main>
    );
  }
  if (!profiles.length && !location.pathname.startsWith('/onboarding') && location.pathname !== '/privacy') {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <>
      <Outlet />
      <Toast />
    </>
  );
}
