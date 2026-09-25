import { createBrowserRouter } from 'react-router';
import { AppShell } from './features/shell/AppShell';
import { HomeScreen } from './features/home/HomeScreen';
import { CalendarScreen } from './features/calendar/CalendarScreen';
import { InsightsScreen } from './features/insights/InsightsScreen';
import { CircleScreen } from './features/circle/CircleScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'calendar', element: <CalendarScreen /> },
      { path: 'insights', element: <InsightsScreen /> },
      { path: 'circle', element: <CircleScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: '*', element: <HomeScreen /> },
    ],
  },
]);
