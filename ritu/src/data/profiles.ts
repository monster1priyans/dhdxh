import { DEFAULTS } from '../../shared/engine';
import { emitChange, getDb, PROFILE_STORES } from './db';
import type { Profile } from './types';
import { normalizeProfile } from './normalize';

export type NewProfile = Pick<Profile, 'name' | 'colour'> & Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>;

export async function listProfiles(): Promise<Profile[]> {
  const all = (await (await getDb()).getAll('profiles')).map(p => normalizeProfile(p as unknown as Record<string, unknown>));
  return all.sort((a, b) => a.createdAt - b.createdAt || a.name.localeCompare(b.name));
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const p = await (await getDb()).get('profiles', id);
  return p ? normalizeProfile(p as unknown as Record<string, unknown>) : undefined;
}

export async function createProfile(p: NewProfile): Promise<Profile> {
  const now = Date.now();
  const profile: Profile = {
    birthYear: null, mode: 'track', isManaged: false, showFertility: false, discreet: true,
    settings: { ...DEFAULTS }, prediction: null, trackPill: false, dueDate: null,
    ...p,
    id: crypto.randomUUID(), createdAt: now, updatedAt: now,
  };
  await (await getDb()).add('profiles', profile);
  emitChange('profiles', profile.id);
  return profile;
}

export async function updateProfile(id: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<Profile> {
  const db = await getDb();
  const tx = db.transaction('profiles', 'readwrite');
  const found = await tx.store.get(id);
  if (!found) throw new Error(`Profile ${id} not found`);
  const cur = normalizeProfile(found as unknown as Record<string, unknown>);
  const next: Profile = { ...cur, ...patch, id, createdAt: cur.createdAt, updatedAt: Date.now() };
  await tx.store.put(next);
  await tx.done;
  emitChange('profiles', id);
  return next;
}

/** Deletes the profile and everything that belongs to her, in one transaction. */
export async function deleteProfile(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['profiles', ...PROFILE_STORES], 'readwrite');
  for (const s of PROFILE_STORES) {
    const store = tx.objectStore(s);
    for (const key of await store.index('pid').getAllKeys(id)) await store.delete(key);
  }
  await tx.objectStore('profiles').delete(id);
  await tx.done;
  emitChange('profiles', id);
}
