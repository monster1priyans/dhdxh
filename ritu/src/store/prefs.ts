import { create } from 'zustand';

export type WeekStart = 'sun' | 'mon';

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* per-device convenience only */ } };

interface PrefsState {
  activePid: string | null;
  weekStart: WeekStart;
  setActive: (pid: string) => void;
  setWeekStart: (w: WeekStart) => void;
}

export const usePrefs = create<PrefsState>(set => ({
  activePid: read('ritu.active'),
  weekStart: read('ritu.weekStart') === 'mon' ? 'mon' : 'sun',
  setActive: pid => { write('ritu.active', pid); set({ activePid: pid }); },
  setWeekStart: w => { write('ritu.weekStart', w); set({ weekStart: w }); },
}));
