import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import './styles/index.css';
import './i18n';
import { applyTheme, storedTheme } from './lib/theme';
import { isNative } from './lib/platform';
import { SetupGate } from './features/setup/SetupGate';
import { router } from './router';

applyTheme(storedTheme());

// One service worker, web only. Inside Capacitor the app is already local, and a SW would break it.
if (!isNative() && 'serviceWorker' in navigator && import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SetupGate>
      <RouterProvider router={router} />
    </SetupGate>
  </StrictMode>,
);
