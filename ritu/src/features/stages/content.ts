// Translation-key lists for the stage cards (kept apart from the components so tests can import them).

/** Postnatal check-ups by days since the birth (inclusive). A general guide; her doctor or ASHA may plan differently. */
export const POSTNATAL = [
  { id: 'first_week', from: 0, to: 7 },
  { id: 'six_weeks', from: 35, to: 49 },
] as const;

/** Warning signs that need a doctor at once, after a birth and after a pregnancy loss. */
export const URGENT_BIRTH = ['bleeding', 'fever', 'smell', 'headache', 'leg', 'breath', 'harm'] as const;
export const URGENT_LOSS = ['bleeding', 'fever', 'smell', 'pain', 'long'] as const;

/** Before the first period. */
export const SIGNS = ['breasts', 'growth', 'hair', 'discharge'] as const;
export const KIT = ['pads', 'underwear', 'bag', 'tissues'] as const;
export const TALK = ['early', 'normal', 'pad', 'ask', 'irregular'] as const;
export const DOCTOR = ['age15', 'three_years', 'no_breasts', 'before8'] as const;
