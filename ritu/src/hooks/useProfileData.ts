import { useEffect, useState } from 'react';
import { onChange } from '../data/db';
import { listLogs, listPrivate } from '../data/logs';
import { listPeriods } from '../data/periods';
import type { LogRec, PeriodRec, PrivateRec } from '../data/types';

export interface ProfileData { periods: PeriodRec[]; logs: LogRec[]; loaded: boolean }

/** Periods + logs of one profile, re-read whenever they change. */
export function useProfileData(pid: string | undefined): ProfileData {
  const [data, setData] = useState<ProfileData>({ periods: [], logs: [], loaded: false });
  useEffect(() => {
    if (!pid) return;
    let alive = true;
    const load = async () => {
      const [periods, logs] = await Promise.all([listPeriods(pid), listLogs(pid)]);
      if (alive) setData({ periods, logs, loaded: true });
    };
    setData({ periods: [], logs: [], loaded: false });
    void load();
    const off = onChange((store, id) => { if (id === pid && (store === 'periods' || store === 'logs')) void load(); });
    return () => { alive = false; off(); };
  }, [pid]);
  return data;
}

/** Periods of every profile (for Home and the "Everyone" calendar). */
export function useAllPeriods(pids: string[]): Record<string, PeriodRec[]> {
  const [map, setMap] = useState<Record<string, PeriodRec[]>>({});
  const key = pids.join(',');
  useEffect(() => {
    let alive = true;
    const ids = key ? key.split(',') : [];
    const load = async () => {
      const entries = await Promise.all(ids.map(async id => [id, await listPeriods(id)] as const));
      if (alive) setMap(Object.fromEntries(entries));
    };
    void load();
    const off = onChange(store => { if (store === 'periods') void load(); });
    return () => { alive = false; off(); };
  }, [key]);
  return map;
}

export function usePrivate(pid: string | undefined, enabled: boolean): PrivateRec[] {
  const [recs, setRecs] = useState<PrivateRec[]>([]);
  useEffect(() => {
    if (!pid || !enabled) { setRecs([]); return; }
    let alive = true;
    const load = async () => { const r = await listPrivate(pid); if (alive) setRecs(r); };
    void load();
    const off = onChange((store, id) => { if (store === 'private' && id === pid) void load(); });
    return () => { alive = false; off(); };
  }, [pid, enabled]);
  return recs;
}
