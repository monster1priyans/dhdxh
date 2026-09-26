import { Capacitor } from '@capacitor/core';

/** True inside the Capacitor Android app, false in a browser. */
export const isNative = (): boolean => Capacitor.isNativePlatform();

export const platform = (): 'android' | 'ios' | 'web' => Capacitor.getPlatform() as 'android' | 'ios' | 'web';
