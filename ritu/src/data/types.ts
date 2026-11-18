import type { CycleSettings, Flow, ISODate, Mode, Prediction } from '../../shared/engine';

export const BANGLE_COLOURS = ['rani', 'haldi', 'mehendi', 'narangi', 'aasmani', 'jamuni', 'kattha', 'sleti'] as const;
export type BangleColour = (typeof BANGLE_COLOURS)[number];

export const SYMPTOMS = [
  'cramps', 'headache', 'backache', 'bloating', 'acne', 'breast_tenderness',
  'fatigue', 'nausea', 'cravings', 'insomnia', 'dizziness', 'upset_stomach',
  'constipation', 'hot_flashes', 'joint_pain',
] as const;
export type Symptom = (typeof SYMPTOMS)[number];

export const MOODS = ['happy', 'calm', 'energetic', 'sensitive', 'sad', 'irritable', 'anxious', 'stressed'] as const;
export type Mood = (typeof MOODS)[number];

export const DISCHARGES = ['dry', 'sticky', 'creamy', 'watery', 'egg_white', 'unusual'] as const;
export type Discharge = (typeof DISCHARGES)[number];

/** Allowed ranges for numbers she types in (also used to validate backups). */
export const RANGES = {
  bbt: { min: 35, max: 38 },      // °C
  weight: { min: 20, max: 250 },  // kg
  sleep: { min: 0, max: 24 },     // hours
  water: { min: 0, max: 30 },     // glasses
} as const;

export type PregnancyOutcome = 'birth' | 'loss';
export interface PregnancyEnd { date: ISODate; outcome: PregnancyOutcome }

/** Timestamps are epoch milliseconds; cycle dates are always "YYYY-MM-DD" strings. */
export interface Profile {
  id: string;
  name: string;
  colour: BangleColour;
  birthYear: number | null;
  mode: Mode;
  /** created by someone else for her (e.g. a mother for her daughter) */
  isManaged: boolean;
  showFertility: boolean;
  discreet: boolean;
  settings: CycleSettings;
  prediction: Prediction | null;
  /** adds "Taken / Missed" to the daily log */
  trackPill: boolean;
  /** pregnancy mode: expected due date */
  dueDate: ISODate | null;
  /** set up before her first period (e.g. by a parent for a young daughter) */
  firstPeriodPending: boolean;
  /** when and how her last pregnancy ended; periods that started before it don't count towards predictions */
  pregnancyEnd: PregnancyEnd | null;
  createdAt: number;
  updatedAt: number;
}

export interface PeriodRec {
  id: string;
  pid: string;
  startDate: ISODate;
  endDate: ISODate | null;
  updatedAt: number;
}

export interface LogRec {
  pid: string;
  date: ISODate; // one log per profile per day
  flow: Flow | null;
  symptoms: Symptom[];
  mood: Mood | null;
  pain: number | null; // 0–10
  notes: string;
  bbt: number | null; // °C
  lhTest: 'positive' | 'negative' | null;
  discharge: Discharge | null;
  pill: 'taken' | 'missed' | null;
  sleep: number | null; // hours
  water: number | null; // glasses
  weight: number | null; // kg
  updatedAt: number;
}

export interface PrivateRec {
  pid: string;
  date: ISODate;
  intimacy: 'none' | 'protected' | 'unprotected' | null;
  pregnancyTest: 'positive' | 'negative' | null;
  note: string;
  updatedAt: number;
}

export type ReminderType = 'period_soon' | 'period_late' | 'fertile_soon' | 'daily_log' | 'pill';

export interface ReminderRec {
  id: string;
  pid: string;
  type: ReminderType;
  daysBefore: number;
  time: string; // 'HH:mm', device local time
  enabled: boolean;
}
