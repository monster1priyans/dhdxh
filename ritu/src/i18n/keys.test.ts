import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from './en.json';
import hi from './hi.json';
import { BANGLE_COLOURS, DISCHARGES, MOODS, SYMPTOMS } from '../data/types';
import { CHECKUPS } from '../lib/pregnancy';
import { TIP_COUNTS } from '../lib/tips';
import { REMINDER_TYPES } from '../data/reminders';

const flat = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v as object, `${p}${k}.`) : [`${p}${k}`]));
const keys = (o: object) => new Set(flat(o).map(k => k.replace(/_(one|other)$/, '')));

const files = (dir: string): string[] => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) && !f.endsWith('.test.ts') ? [p] : [];
});

const FLAGS = ['cycle_length', 'irregular', 'long_period', 'missed', 'heavy_flow', 'severe_pain', 'between_bleeding', 'missed_log', 'period_not_ended'];
const dynamic = [
  ...BANGLE_COLOURS.map(c => `colours.${c}`), ...MOODS.map(m => `mood.${m}`), ...SYMPTOMS.map(s => `symptom.${s}`),
  ...['spotting', 'light', 'medium', 'heavy', 'very_heavy'].map(f => `flow.${f}`),
  ...['track', 'ttc', 'pregnant'].flatMap(m => [`mode.${m}`, `mode.${m}Hint`]),
  ...['menstrual', 'follicular', 'ovulation', 'luteal', 'late'].map(p => `phase.${p}`),
  ...['high', 'medium', 'low'].flatMap(c => [`confidence.${c}`, `confidenceShort.${c}`]),
  ...FLAGS.flatMap(f => [`flag.${f}.title`, `flag.${f}.noticed`, `flag.${f}.why`]),
  ...REMINDER_TYPES.map(r => `reminders.${r}`),
  ...['home', 'calendar', 'insights', 'profiles', 'settings'].map(k => `tabs.${k}`),
  ...['en', 'hi'].map(l => `lang.${l}`),
  ...DISCHARGES.map(d => `discharge.${d}`), 'log.pill_taken', 'log.pill_missed',
  ...CHECKUPS.map(c => `checkup.${c.id}`),
  ...Object.entries(TIP_COUNTS).flatMap(([g, n]) => Array.from({ length: n }, (_, i) => `tips.${g}.${i + 1}`)),
  ...['peak', 'high', 'low'].flatMap(l => [`ttc.level_${l}`, `ttc.levelHint_${l}`]),
  ...['future', 'order', 'overlap'].map(e => `history.error_${e}`),
  ...['period', 'fertile', 'due'].map(k => `upcoming.${k}`),
  ...['not_enough', 'same', 'regular', 'irregular', 'young'].map(k => `regularity.${k}`),
  ...['none', 'protected', 'unprotected'].map(v => `log.intimacy_${v}`), 'log.positive', 'log.negative',
  ...['what', 'where', 'share', 'pin', 'notify', 'export', 'delete', 'children', 'medical', 'contact'].flatMap(s => [`policy.${s}.title`, `policy.${s}.body`]),
];

describe('translations', () => {
  it('en and hi have the same keys', () => {
    expect([...keys(hi)].sort()).toEqual([...keys(en)].sort());
  });

  it('every key the code uses exists', () => {
    const used = new Set<string>(dynamic);
    for (const f of files('src')) {
      for (const m of readFileSync(f, 'utf8').matchAll(/\bt\(\s*'([a-zA-Z_.]+)'/g)) used.add(m[1]);
    }
    const have = keys(en);
    expect([...used].filter(k => !have.has(k))).toEqual([]);
  });
});
