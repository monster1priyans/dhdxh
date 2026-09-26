import { create } from 'zustand';
import { onChange } from '../data/db';
import { listProfiles } from '../data/profiles';
import type { Profile } from '../data/types';

interface ProfilesState {
  profiles: Profile[];
  loaded: boolean;
  reload: () => Promise<void>;
}

export const useProfiles = create<ProfilesState>(set => ({
  profiles: [],
  loaded: false,
  reload: async () => set({ profiles: await listProfiles(), loaded: true }),
}));

onChange(store => { if (store === 'profiles') void useProfiles.getState().reload(); });

export const useProfile = (pid: string | undefined): Profile | undefined =>
  useProfiles(s => s.profiles.find(p => p.id === pid));
