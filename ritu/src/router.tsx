import { lazy, Suspense } from 'react';
import { createBrowserRouter, createMemoryRouter } from 'react-router';
import { Root } from './features/shell/Root';
import { AppShell } from './features/shell/AppShell';
import { HomeScreen } from './features/home/HomeScreen';
import { CalendarScreen } from './features/calendar/CalendarScreen';
import { ProfilesScreen } from './features/profiles/ProfilesScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { Onboarding } from './features/onboarding/Onboarding';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { ProfileSettingsScreen } from './features/profile/ProfileSettings';
import { PrivacyScreen } from './features/privacy/PrivacyScreen';

// charts are heavy: load the Insights screen on first visit
const InsightsScreen = lazy(() => import('./features/insights/InsightsScreen').then(m => ({ default: m.InsightsScreen })));

// the artifact build lives at a URL it doesn't control, so it keeps routes in memory
const createRouter = import.meta.env.MODE === 'artifact' ? createMemoryRouter : createBrowserRouter;

export const router = createRouter([
  {
    element: <Root />,
    children: [
      { path: 'onboarding', element: <Onboarding /> },
      { path: 'privacy', element: <PrivacyScreen /> },
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomeScreen /> },
          { path: 'p/:pid', element: <ProfileScreen /> },
          { path: 'p/:pid/settings', element: <ProfileSettingsScreen /> },
          { path: 'calendar', element: <CalendarScreen /> },
          { path: 'insights', element: <Suspense fallback={null}><InsightsScreen /></Suspense> },
          { path: 'profiles', element: <ProfilesScreen /> },
          { path: 'settings', element: <SettingsScreen /> },
          { path: '*', element: <HomeScreen /> },
        ],
      },
    ],
  },
]);
