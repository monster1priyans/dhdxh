import { create } from 'zustand';

export interface ToastAction {
  label: string;
  run: () => void | Promise<void>;
}

interface ToastState {
  message: string | null;
  action: ToastAction | null;
  key: number;
  show: (message: string, action?: ToastAction) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>(set => ({
  message: null,
  action: null,
  key: 0,
  show: (message, action) => {
    clearTimeout(timer);
    set(s => ({ message, action: action ?? null, key: s.key + 1 }));
    // A toast with a button stays longer so there is time to tap it
    timer = setTimeout(() => set({ message: null, action: null }), action ? 6000 : 2600);
  },
  hide: () => {
    clearTimeout(timer);
    set({ message: null, action: null });
  },
}));

export const toast = (message: string, action?: ToastAction) => useToast.getState().show(message, action);
