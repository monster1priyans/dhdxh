// Records written by older versions, or read from a backup file, may lack newer fields or hold junk.
// Everything the app reads passes through here, so screens can trust the shapes in types.ts.
import { DEFAULTS, type Flow, type ISODate, type Mode } from '../../shared/engine';
import {
  BANGLE_COLOURS, DISCHARGES, MOODS, RANGES, SYMPTOMS,
  type BangleColour, type Discharge, type LogRec, type Mood, type PregnancyEnd, type Profile, type Symptom,
} from './types';

const FLOWS: Flow[] = ['spotting', 'light', 'medium', 'heavy', 'very_heavy'];
const MODES: Mode[] = ['track', 'ttc', 'pregnant'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Loose = Record<string, unknown>;
const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
  (allowed as readonly unknown[]).includes(v) ? (v as T) : null;
const num = (v: unknown, r: { min: number; max: number }): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= r.min && v <= r.max ? v : null;
export const isIsoDate = (v: unknown): v is ISODate => typeof v === 'string' && DATE.test(v);

export function normalizeLog(raw: Loose, pid = String(raw.pid ?? '')): LogRec {
  return {
    pid,
    date: String(raw.date),
    flow: pick(raw.flow, FLOWS),
    symptoms: Array.isArray(raw.symptoms) ? [...new Set(raw.symptoms.filter((s): s is Symptom => (SYMPTOMS as readonly unknown[]).includes(s)))] : [],
    mood: pick<Mood>(raw.mood, MOODS),
    pain: num(raw.pain, { min: 0, max: 10 }),
    notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 1000) : '',
    bbt: num(raw.bbt, RANGES.bbt),
    lhTest: pick(raw.lhTest, ['positive', 'negative'] as const),
    discharge: pick<Discharge>(raw.discharge, DISCHARGES),
    pill: pick(raw.pill, ['taken', 'missed'] as const),
    sleep: num(raw.sleep, RANGES.sleep),
    water: num(raw.water, RANGES.water),
    weight: num(raw.weight, RANGES.weight),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
  };
}

function pregnancyEnd(v: unknown): PregnancyEnd | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Loose;
  const outcome = pick(o.outcome, ['birth', 'loss'] as const);
  return isIsoDate(o.date) && outcome ? { date: o.date, outcome } : null;
}

export function normalizeProfile(raw: Loose): Profile {
  const s = (raw.settings ?? {}) as Loose;
  const setting = (k: 'cycleLen' | 'periodLen' | 'lutealLen', min: number, max: number) =>
    num(s[k], { min, max }) ?? DEFAULTS[k];
  return {
    id: String(raw.id),
    name: String(raw.name ?? '').slice(0, 80),
    colour: pick<BangleColour>(raw.colour, BANGLE_COLOURS) ?? 'jamuni',
    birthYear: typeof raw.birthYear === 'number' ? raw.birthYear : null,
    mode: pick(raw.mode, MODES) ?? 'track',
    isManaged: Boolean(raw.isManaged),
    showFertility: Boolean(raw.showFertility),
    discreet: raw.discreet !== false,
    settings: { cycleLen: setting('cycleLen', 15, 90), periodLen: setting('periodLen', 1, 15), lutealLen: setting('lutealLen', 8, 20) },
    prediction: (raw.prediction ?? null) as Profile['prediction'],
    trackPill: Boolean(raw.trackPill),
    dueDate: isIsoDate(raw.dueDate) ? raw.dueDate : null,
    firstPeriodPending: Boolean(raw.firstPeriodPending),
    pregnancyEnd: pregnancyEnd(raw.pregnancyEnd),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}
