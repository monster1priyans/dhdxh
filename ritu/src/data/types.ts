import type { CycleSettings, Flow, ISODate, Mode, Prediction } from '../../shared/engine';

export const BANGLE_COLOURS = ['rani', 'haldi', 'mehendi', 'narangi', 'aasmani', 'jamuni', 'kattha', 'sleti'] as const;
export type BangleColour = (typeof BANGLE_COLOURS)[number];

export const SYMPTOMS = [
  'cramps', 'headache', 'backache', 'bloating', 'acne', 'breast_tenderness',
  'fatigue', 'nausea', 'cravings', 'insomnia', 'dizziness', 'upset_stomach',
] as const;
export type Symptom = (typeof SYMPTOMS)[number];

export const MOODS = ['happy', 'calm', 'energetic', 'sensitive', 'sad', 'irritable', 'anxious'] as const;
export type Mood = (typeof MOODS)[number];

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
