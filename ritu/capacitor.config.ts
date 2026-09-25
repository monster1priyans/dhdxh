import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.ritu',
  appName: 'Ritu',
  webDir: 'dist',
  android: { allowMixedContent: false },
  plugins: {
    FirebaseAuthentication: {
      // native sign-in only returns the Google idToken; the JS SDK links it
      skipNativeAuth: true,
      providers: ['google.com'],
    },
    LocalNotifications: {
      iconColor: '#3B3486',
    },
  },
};

export default config;
