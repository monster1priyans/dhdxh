import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.ritu',
  appName: 'Ritu',
  webDir: 'dist',
  android: { allowMixedContent: false },
  plugins: {
    LocalNotifications: {
      iconColor: '#3B3486',
    },
  },
};

export default config;
