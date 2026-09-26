import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { computePrediction, DEFAULTS, healthFlags } from '../../shared/engine';
import type { LogRec, Profile } from '../data/types';
import { buildBackup, parseBackup, restoreBackup } from './backup';
import { logsCsv, periodsCsv } from './export';
import { cycleBars, symptomHeatmap } from './insights';
import { buildReport, reportHtml } from './report';
import { createProfile, listProfiles } from '../data/profiles';
import { addPeriod, listPeriods } from '../data/periods';
import { emptyLog, listLogs, saveLog } from '../data/logs';

const log = (date: string, p: Partial<LogRec> = {}): LogRec => ({ ...emptyLog('p', date), ...p });
const periods = ['2026-01-01', '2026-01-29', '2026-02-26'].map((s, i) => ({ id: `${i}`, startDate: s, endDate: s.replace(/-(\d\d)$/, (_, d) => `-${String(Number(d) + 4).padStart(2, '0')}`) }));

describe('export', () => {
  it('writes CSV with escaping and formula protection', () => {
    expect(periodsCsv([{ id: 'a', pid: 'p', startDate: '2026-01-01', endDate: '2026-01-05', updatedAt: 0 }]))
      .toBe('start_date,end_date,length_days\r\n2026-01-01,2026-01-05,5\r\n');
    const out = logsCsv([log('2026-01-02', { flow: 'heavy', symptoms: ['cramps', 'acne'], notes: '=HYPERLINK("x"), ok' })]);
    expect(out).toContain('2026-01-02,heavy,cramps;acne,,,,,"\'=HYPERLINK(""x""), ok"');
  });
});

describe('insights', () => {
  it('heatmap: share of cycles with a symptom on each cycle day', () => {
    const logs = [log('2026-01-01', { symptoms: ['cramps'] }), log('2026-01-29', { symptoms: ['cramps'] }), log('2026-01-30', { symptoms: ['acne'] })];
    const h = symptomHeatmap(periods, logs, '2026-03-01');
    expect(h.symptoms).toEqual(['cramps', 'acne']);
    expect(h.cells[0][0]).toBeCloseTo(2 / 3);
    expect(h.cells[1][1]).toBeCloseTo(1 / 3);
    expect(cycleBars(periods, computePrediction(periods))).toEqual([{ start: '2026-01-01', length: 28 }, { start: '2026-01-29', length: 28 }]);
  });
});

describe('doctor report', () => {
  it('summarises the last cycles and escapes her name', () => {
    const profile: Profile = { id: 'p', name: 'प्रिया <b>', colour: 'rani', birthYear: 1996, mode: 'track', isManaged: false, showFertility: false, discreet: true, settings: DEFAULTS, prediction: computePrediction(periods), createdAt: 0, updatedAt: 0 };
    const logs = [log('2026-01-02', { flow: 'very_heavy', pain: 9 }), log('2026-01-03', { flow: 'light', symptoms: ['cramps'] })];
    const flags = healthFlags({ today: '2026-03-01', periods, logs, pred: profile.prediction, age: 30, mode: 'track' });
    const m = buildReport({ profile, periods, logs, age: 30, flags, today: '2026-03-01' });
    expect(m.rows[0]).toEqual({ start: '2026-01-01', cycleLen: 28, periodLen: 5, heaviestFlow: 'very_heavy', maxPain: 9, topSymptoms: ['cramps'] });
    expect(m.rows[2].cycleLen).toBeNull();
    const html = reportHtml(m);
    expect(html).toContain('प्रिया &#60;b&#62;');
    expect(html).toContain('not medical advice');
  });
});

describe('backup', () => {
  it('round-trips profiles, periods and logs; rejects junk', async () => {
    const p = await createProfile({ name: 'Maa', colour: 'haldi' });
    await addPeriod(p.id, '2026-09-01', '2026-09-05');
    await saveLog({ ...emptyLog(p.id, '2026-09-02'), flow: 'heavy' });
    const text = JSON.stringify(await buildBackup([p.id], () => true));
    const parsed = parseBackup(text);
    const idb = await import('./../data/db');
    await idb._resetDbForTests();
    indexedDB.deleteDatabase('ritu');
    await restoreBackup(parsed);
    expect((await listProfiles()).map(x => x.name)).toEqual(['Maa']);
    expect(await listPeriods(p.id)).toHaveLength(1);
    expect((await listLogs(p.id))[0].flow).toBe('heavy');
    expect(() => parseBackup('{}')).toThrow('not_ritu');
    expect(() => parseBackup('nope')).toThrow('not_json');
    expect(() => parseBackup(JSON.stringify({ app: 'ritu', profiles: [{ profile: { id: 1 } }] }))).toThrow('bad_profile');
  });
});
