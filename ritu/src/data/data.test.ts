import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { _resetDbForTests, getDb, onChange } from './db';
import { createProfile, deleteProfile, listProfiles, updateProfile } from './profiles';
import { addPeriod, listPeriods, updatePeriod } from './periods';
import { emptyLog, emptyPrivate, getLog, listLogs, listPrivate, saveLog, savePrivate } from './logs';

beforeEach(async () => {
  await _resetDbForTests();
  await new Promise<void>((res, rej) => {
    const r = indexedDB.deleteDatabase('ritu');
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
});

describe('local data', () => {
  it('creates profiles with defaults, lists them oldest first, updates them', async () => {
    const a = await createProfile({ name: 'Maa', colour: 'rani' });
    await new Promise(r => setTimeout(r, 2));
    const b = await createProfile({ name: 'Priya', colour: 'haldi', birthYear: 2012, isManaged: true });
    expect(a).toMatchObject({ mode: 'track', discreet: true, showFertility: false, settings: { cycleLen: 28 } });
    expect((await listProfiles()).map(p => p.name)).toEqual(['Maa', 'Priya']);
    const u = await updateProfile(b.id, { name: 'Priya S' });
    expect(u.name).toBe('Priya S');
    expect(u.createdAt).toBe(b.createdAt);
  });

  it('keeps each profile\'s periods and logs separate', async () => {
    const a = await createProfile({ name: 'A', colour: 'rani' });
    const b = await createProfile({ name: 'B', colour: 'haldi' });
    const p = await addPeriod(a.id, '2026-09-01', null);
    await addPeriod(b.id, '2026-09-10', '2026-09-14');
    await updatePeriod(p.id, { endDate: '2026-09-05' });
    expect(await listPeriods(a.id)).toMatchObject([{ startDate: '2026-09-01', endDate: '2026-09-05' }]);
    await saveLog({ ...emptyLog(a.id, '2026-09-02'), flow: 'heavy' });
    await saveLog({ ...emptyLog(b.id, '2026-09-02'), mood: 'calm' });
    expect(await listLogs(a.id)).toHaveLength(1);
    expect((await getLog(a.id, '2026-09-02'))?.flow).toBe('heavy');
    expect(await listLogs(a.id, '2026-09-03', '2026-09-30')).toHaveLength(0);
  });

  it('removes empty logs', async () => {
    const a = await createProfile({ name: 'A', colour: 'rani' });
    await saveLog({ ...emptyLog(a.id, '2026-09-02'), pain: 4 });
    await saveLog(emptyLog(a.id, '2026-09-02'));
    expect(await getLog(a.id, '2026-09-02')).toBeUndefined();
  });

  it('deletes a profile with all of her data and nobody else\'s', async () => {
    const a = await createProfile({ name: 'A', colour: 'rani' });
    const b = await createProfile({ name: 'B', colour: 'haldi' });
    for (const pid of [a.id, b.id]) {
      await addPeriod(pid, '2026-09-01', null);
      await saveLog({ ...emptyLog(pid, '2026-09-01'), flow: 'light' });
      await savePrivate({ ...emptyPrivate(pid, '2026-09-01'), note: 'x' });
    }
    await deleteProfile(a.id);
    expect((await listProfiles()).map(p => p.id)).toEqual([b.id]);
    expect(await listPeriods(a.id)).toEqual([]);
    expect(await listLogs(a.id)).toEqual([]);
    expect(await listPrivate(a.id)).toEqual([]);
    expect(await listPeriods(b.id)).toHaveLength(1);
    expect(await listPrivate(b.id)).toHaveLength(1);
  });

  it('notifies listeners on change', async () => {
    const seen: string[] = [];
    const off = onChange(s => seen.push(s));
    const a = await createProfile({ name: 'A', colour: 'rani' });
    await addPeriod(a.id, '2026-09-01', null);
    off();
    expect(seen).toEqual(['profiles', 'periods']);
  });

  it('survives reopening the database (app restart)', async () => {
    await createProfile({ name: 'A', colour: 'rani' });
    await _resetDbForTests();
    await getDb();
    expect(await listProfiles()).toHaveLength(1);
  });
});
