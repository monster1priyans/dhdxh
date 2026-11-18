import { Preferences } from '@capacitor/preferences';

/** Small device-only key/value store (Android SharedPreferences, localStorage on web). Never synced. */
export const kv = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    try { return JSON.parse(value) as T; } catch { return null; }
  },
  set: (key: string, value: unknown) => Preferences.set({ key, value: JSON.stringify(value) }),
  remove: (key: string) => Preferences.remove({ key }),
};
