import { create } from 'zustand';
import { kv } from '../lib/kv';
import {
  afterRightPin, afterWrongTry, createPinRecord, freshState, MAX_TRIES, RESET_DELAY_MS, verifyPin,
  type PinRecord, type PinState,
} from '../lib/pin';

const pinKey = (pid: string) => `pin:${pid}`;
const stateKey = (pid: string) => `pinstate:${pid}`;

export type UnlockResult =
  | { kind: 'ok' }
  | { kind: 'wrong'; triesLeft: number }
  | { kind: 'locked_out'; until: number };

interface LockState {
  /** profiles that have a PIN (device-only) */
  pinned: Record<string, boolean>;
  pinState: Record<string, PinState>;
  /** unlocked in this session; memory only, never stored */
  unlocked: Record<string, boolean>;
  load: (pids: string[]) => Promise<void>;
  tryUnlock: (pid: string, pin: string) => Promise<UnlockResult>;
  setPin: (pid: string, pin: string) => Promise<void>;
  removePin: (pid: string) => Promise<void>;
  forgotPin: (pid: string) => Promise<void>;
  lockAll: () => void;
  lock: (pid: string) => void;
}

export const useLock = create<LockState>((set, get) => ({
  pinned: {},
  pinState: {},
  unlocked: {},

  load: async pids => {
    const pinned: Record<string, boolean> = {};
    const pinState: Record<string, PinState> = {};
    const now = Date.now();
    for (const pid of pids) {
      const rec = await kv.get<PinRecord>(pinKey(pid));
      if (!rec) continue;
      const st = (await kv.get<PinState>(stateKey(pid))) ?? freshState();
      if (st.resetAt !== null && now >= st.resetAt) {
        // "Forgot PIN" waited its 24 hours: the PIN is removed
        await kv.remove(pinKey(pid));
        await kv.remove(stateKey(pid));
        continue;
      }
      pinned[pid] = true;
      pinState[pid] = st;
    }
    set({ pinned, pinState });
  },

  tryUnlock: async (pid, pin) => {
    const rec = await kv.get<PinRecord>(pinKey(pid));
    if (!rec) {
      set(s => ({ unlocked: { ...s.unlocked, [pid]: true } }));
      return { kind: 'ok' };
    }
    const now = Date.now();
    const st = get().pinState[pid] ?? freshState();
    if (st.lockedUntil > now) return { kind: 'locked_out', until: st.lockedUntil };
    if (await verifyPin(pin, rec)) {
      const next = afterRightPin(); // also cancels a pending "Forgot PIN" reset
      await kv.set(stateKey(pid), next);
      set(s => ({ unlocked: { ...s.unlocked, [pid]: true }, pinState: { ...s.pinState, [pid]: next } }));
      return { kind: 'ok' };
    }
    const next = afterWrongTry(st, now);
    await kv.set(stateKey(pid), next);
    set(s => ({ pinState: { ...s.pinState, [pid]: next } }));
    return next.lockedUntil > now
      ? { kind: 'locked_out', until: next.lockedUntil }
      : { kind: 'wrong', triesLeft: MAX_TRIES - next.fails };
  },

  setPin: async (pid, pin) => {
    await kv.set(pinKey(pid), await createPinRecord(pin));
    await kv.set(stateKey(pid), freshState());
    set(s => ({
      pinned: { ...s.pinned, [pid]: true },
      pinState: { ...s.pinState, [pid]: freshState() },
      unlocked: { ...s.unlocked, [pid]: true },
    }));
  },

  removePin: async pid => {
    await kv.remove(pinKey(pid));
    await kv.remove(stateKey(pid));
    set(s => {
      const pinned = { ...s.pinned };
      delete pinned[pid];
      return { pinned };
    });
  },

  forgotPin: async pid => {
    const st = { ...(get().pinState[pid] ?? freshState()), resetAt: Date.now() + RESET_DELAY_MS };
    await kv.set(stateKey(pid), st);
    set(s => ({ pinState: { ...s.pinState, [pid]: st } }));
  },

  lockAll: () => set({ unlocked: {} }),
  lock: pid => set(s => {
    const unlocked = { ...s.unlocked };
    delete unlocked[pid];
    return { unlocked };
  }),
}));

/** Hook: is this profile hidden behind its PIN right now? */
export const useIsLocked = (pid: string | undefined) =>
  useLock(s => Boolean(pid && s.pinned[pid] && !s.unlocked[pid]));

export const isLockedNow = (pid: string) => {
  const s = useLock.getState();
  return Boolean(s.pinned[pid] && !s.unlocked[pid]);
};
