import { describe, expect, it } from 'vitest';
import { LEARN, type LearnContent } from './content';
import { STAGES } from './stages';

const shape = (c: LearnContent) => ({
  paragraphs: c.overview.paragraphs.length,
  columns: c.timeline.columns.length,
  rows: c.timeline.rows.map(r => r.length),
  phases: c.phases.map(p => [p.id, p.fields.length]),
  outcomes: c.outcomes.items.length,
  hormones: c.hormones.items.map(h => h.name.length > 0),
  sequence: c.hormones.sequence.length,
  variation: c.variation.items.length,
  notes: c.variation.notes.length,
  care: c.care.items.length,
  segments: [c.diagram.ovarianSegments, c.diagram.uterineSegments].map(ss => ss.map(s => [s.from, s.to, s.tone])),
});

describe('cycle guide content', () => {
  it('English and Hindi have the same structure', () => {
    expect(shape(LEARN.hi)).toEqual(shape(LEARN.en));
  });

  it('every timeline row fills every column', () => {
    for (const c of Object.values(LEARN)) {
      expect(c.timeline.columns).toHaveLength(8);
      c.timeline.rows.forEach(r => expect(r).toHaveLength(8));
    }
  });

  it('covers the six phases A–F in order', () => {
    expect(LEARN.en.phases.map(p => p.id)).toEqual(['menstrual', 'follicular', 'proliferative', 'ovulation', 'luteal', 'late-luteal']);
  });

  it('diagram segments cover days 1–28 without gaps', () => {
    for (const segs of [LEARN.en.diagram.ovarianSegments, LEARN.en.diagram.uterineSegments]) {
      expect(segs[0].from).toBe(1);
      segs.slice(1).forEach((s, i) => expect(s.from).toBe(segs[i].to + 1));
      expect(segs[segs.length - 1].to).toBe(28);
    }
  });

  it('keeps the key accuracy statements', () => {
    const en = JSON.stringify(LEARN.en);
    expect(en).toContain('simplified teaching model');
    expect(en).toContain('first day of full menstrual bleeding');
    expect(en).toContain('Not everyone ovulates on day 14');
    expect(en).toContain('does not simply come out in the period');
    expect(en).toContain('not a reliable way to prevent pregnancy');
    expect(en).toMatch(/women and other people who menstruate/);
  });

  it('stage by stage: the seven stages, same in both languages', () => {
    const shape = (c: typeof STAGES.en) => c.items.map(s => [s.id, s.from, s.to, s.maybe ?? null, s.fields.length]);
    expect(shape(STAGES.hi)).toEqual(shape(STAGES.en));
    expect(STAGES.en.items.map(s => s.headline)).toEqual([
      'Day 1: First day of full menstrual bleeding.',
      'Days 1–5: Menstrual phase; this overlaps with the early follicular phase.',
      'Days 1–13/14: Follicular phase; follicles develop and estrogen rises.',
      'Days 6–13: Proliferative phase; the uterine lining rebuilds after bleeding.',
      'Around Day 14: Ovulation; an egg is released from an ovary.',
      'Days 15–28: Luteal phase and secretory phase; progesterone supports the uterine lining.',
      'Days 22–28: Late luteal phase; if pregnancy has not occurred, hormone levels fall and the next period begins.',
    ]);
    STAGES.en.items.forEach(s => {
      expect(s.from).toBeGreaterThanOrEqual(1);
      expect(s.to).toBeLessThanOrEqual(28);
      expect(s.from).toBeLessThanOrEqual(s.to);
    });
  });
});
