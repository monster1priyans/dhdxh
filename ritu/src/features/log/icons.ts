import {
  Angry, Annoyed, BatteryLow, Brain, Cookie, Feather, Frown, Heart, Leaf, MoonStar, Orbit,
  PersonStanding, Smile, Soup, Sparkles, Sun, Waves, Wind, Zap, type LucideIcon,
} from 'lucide-react';
import type { Mood, Symptom } from '../../data/types';

export const SYMPTOM_ICONS: Record<Symptom, LucideIcon> = {
  cramps: Zap, headache: Brain, backache: PersonStanding, bloating: Wind, acne: Sparkles,
  breast_tenderness: Heart, fatigue: BatteryLow, nausea: Waves, cravings: Cookie, insomnia: MoonStar,
  dizziness: Orbit, upset_stomach: Soup,
};

export const MOOD_ICONS: Record<Mood, LucideIcon> = {
  happy: Smile, calm: Leaf, energetic: Sun, sensitive: Feather, sad: Frown, irritable: Angry, anxious: Annoyed,
};
