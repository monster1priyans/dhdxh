import { createBrowserRouter } from 'react-router';
import { AppShell } from './features/shell/AppShell';
import { HomeScreen } from './features/home/HomeScreen';
import { CalendarScreen } from './features/calendar/CalendarScreen';
import { InsightsScreen } from './features/insights/InsightsScreen';
import { ProfilesScreen } from './features/profiles/ProfilesScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'calendar', element: <CalendarScreen /> },
      { path: 'insights', element: <InsightsScreen /> },
      { path: 'profiles', element: <ProfilesScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: '*', element: <HomeScreen /> },
    ],
  },
]);
