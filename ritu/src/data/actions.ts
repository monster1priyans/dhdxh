// Every change that can move a prediction goes through here: write, recompute, reschedule reminders.
import { computePrediction, type ISODate } from '../../shared/engine';
import { rescheduleAll } from '../lib/notifications';
import type { PeriodOp } from '../lib/periodRules';
import { addPeriod, deletePeriod, listPeriods, toEnginePeriods, updatePeriod } from './periods';
import { createProfile, getProfile, updateProfile, type NewProfile } from './profiles';
import { createDefaultReminders } from './reminders';
import type { Profile } from './types';

export async function recompute(pid: string): Promise<void> {
  const profile = await getProfile(pid);
  if (!profile) return;
  const prediction = computePrediction(toEnginePeriods(await listPeriods(pid)), profile.settings, profile.mode);
  if (JSON.stringify(prediction) !== JSON.stringify(profile.prediction)) await updateProfile(pid, { prediction });
}

export async function applyPeriodOp(pid: string, op: PeriodOp): Promise<void> {
  switch (op.type) {
    case 'none': return;
    case 'create': await addPeriod(pid, op.startDate, op.endDate); break;
    case 'delete': await deletePeriod(op.id); break;
    case 'update': {
      const patch: { startDate?: ISODate; endDate?: ISODate | null } = {};
      if (op.startDate !== undefined) patch.startDate = op.startDate;
      if (op.endDate !== undefined) patch.endDate = op.endDate;
      await updatePeriod(op.id, patch);
      break;
    }
  }
  await recompute(pid);
  void rescheduleAll();
}

export async function changeProfile(pid: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<void> {
  await updateProfile(pid, patch);
  if (patch.settings || patch.mode) await recompute(pid);
  void rescheduleAll();
}

export async function setupProfile(p: NewProfile, firstPeriod: { start: ISODate; end: ISODate | null } | null): Promise<Profile> {
  const profile = await createProfile(p);
  await createDefaultReminders(profile.id);
  if (firstPeriod) await addPeriod(profile.id, firstPeriod.start, firstPeriod.end);
  await recompute(profile.id);
  void rescheduleAll();
  return profile;
}

/** Age for health flags: current year minus birth year (null if unknown). */
export const ageOf = (p: Pick<Profile, 'birthYear'>, now = new Date()): number | null =>
  p.birthYear ? now.getFullYear() - p.birthYear : null;
