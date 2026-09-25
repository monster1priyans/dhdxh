import { addDays, sortPeriods, diffDays, type Flow, type HealthFlag, type ISODate, type Period, type Prediction } from '../../shared/engine';
import type { LogRec, Profile, Symptom } from '../data/types';

const FLOW_RANK: Flow[] = ['spotting', 'light', 'medium', 'heavy', 'very_heavy'];

export interface ReportRow {
  start: ISODate; cycleLen: number | null; periodLen: number | null;
  heaviestFlow: Flow | null; maxPain: number | null; topSymptoms: Symptom[];
}

export interface ReportModel {
  name: string; age: number | null; from: ISODate | null; to: ISODate;
  avgCycle: number | null; avgPeriod: number | null; sd: number | null; confidence: Prediction['confidence'] | null; basedOn: number;
  rows: ReportRow[]; flags: HealthFlag[];
}

export function buildReport(a: {
  profile: Profile; periods: Period[]; logs: LogRec[]; age: number | null; flags: HealthFlag[]; today: ISODate;
}): ReportModel {
  const sorted = sortPeriods(a.periods);
  const last = sorted.slice(-6);
  const offset = sorted.length - last.length;
  const rows = last.map((p, i): ReportRow => {
    const next = sorted[offset + i + 1]?.startDate ?? null;
    const end = next ? addDays(next, -1) : a.today;
    const inCycle = a.logs.filter(l => l.date >= p.startDate && l.date <= end);
    const flows = inCycle.map(l => l.flow).filter((f): f is Flow => f !== null);
    const pains = inCycle.map(l => l.pain).filter((x): x is number => x !== null);
    const count = new Map<Symptom, number>();
    inCycle.forEach(l => l.symptoms.forEach(s => count.set(s, (count.get(s) ?? 0) + 1)));
    return {
      start: p.startDate,
      cycleLen: next ? diffDays(next, p.startDate) : null,
      periodLen: p.endDate ? diffDays(p.endDate, p.startDate) + 1 : null,
      heaviestFlow: flows.length ? flows.reduce((m, f) => (FLOW_RANK.indexOf(f) > FLOW_RANK.indexOf(m) ? f : m)) : null,
      maxPain: pains.length ? Math.max(...pains) : null,
      topSymptoms: [...count.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([s]) => s),
    };
  });
  const pred = a.profile.prediction;
  return {
    name: a.profile.name, age: a.age, from: last[0]?.startDate ?? null, to: a.today,
    avgCycle: pred?.avgCycle ?? null, avgPeriod: pred?.avgPeriod ?? null, sd: pred?.sd ?? null,
    confidence: pred?.confidence ?? null, basedOn: pred?.basedOn ?? 0,
    rows, flags: a.flags.filter(f => f.level === 'doctor'),
  };
}

// Medical wording in English (for the doctor), whatever the app language.
const FLAG_EN: Record<string, string> = {
  cycle_length: 'Cycle length outside the typical range (under 21 or over 35 days) for the last 3 cycles.',
  irregular: 'Irregular cycles: the difference between the shortest and longest recent cycle is larger than typical.',
  long_period: 'Menstrual bleeding lasting more than 7 days in at least 2 of the last 3 periods.',
  missed: 'No period recorded for more than 90 days.',
  heavy_flow: 'Very heavy flow (pad change every 1–2 hours) recorded in at least 2 of the last 3 cycles.',
  severe_pain: 'Severe pain (8/10 or more) recorded in at least 2 of the last 3 cycles.',
  between_bleeding: 'Bleeding or spotting between periods in at least 2 of the last 3 cycles.',
};
const FLOW_EN: Record<Flow, string> = { spotting: 'Spotting', light: 'Light', medium: 'Medium', heavy: 'Heavy', very_heavy: 'Very heavy' };
const esc = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const fmt = (d: ISODate) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`));

export const DISCLAIMER_EN = 'Predictions are estimates, not medical advice and not birth control. This report lists what was recorded in the Ritu app; it is not a diagnosis.';

/** Report as HTML (rendered off-screen, so Devanagari names shape correctly), then to PDF. */
export function reportHtml(m: ReportModel): string {
  const td = 'padding:6px 8px;border-bottom:1px solid lightgray;text-align:left;vertical-align:top';
  const rows = m.rows.map(r => `<tr>
    <td style="${td}">${fmt(r.start)}</td><td style="${td}">${r.cycleLen ?? 'ongoing'}</td>
    <td style="${td}">${r.periodLen ?? '–'}</td><td style="${td}">${r.heaviestFlow ? FLOW_EN[r.heaviestFlow] : '–'}</td>
    <td style="${td}">${r.maxPain ?? '–'}</td><td style="${td}">${r.topSymptoms.map(s => s.replace(/_/g, ' ')).join(', ') || '–'}</td></tr>`).join('');
  return `<div style="font-family:Mukta,system-ui,sans-serif;color:black;background:white;padding:40px;width:714px;font-size:13px;line-height:1.45">
  <h1 style="font-family:'Baloo 2',Mukta,sans-serif;font-size:24px;margin:0 0 4px">Menstrual cycle summary</h1>
  <p style="margin:0 0 16px;color:dimgray">Prepared for a doctor’s visit · ${fmt(m.to)}</p>
  <table style="border-collapse:collapse;margin-bottom:16px">
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Name</td><td style="font-size:15px;font-weight:600">${esc(m.name)}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Age</td><td>${m.age ?? 'Not recorded'}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Period covered</td><td>${m.from ? `${fmt(m.from)} – ${fmt(m.to)}` : 'No periods recorded'}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Average cycle</td><td>${m.avgCycle !== null ? `${m.avgCycle} days` : '–'}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Average period</td><td>${m.avgPeriod !== null ? `${m.avgPeriod} days` : '–'}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Cycle variation (SD)</td><td>${m.sd !== null ? `${m.sd} days` : 'Not enough data'}</td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:dimgray">Prediction confidence</td><td>${m.confidence ?? '–'} (based on ${m.basedOn} cycles)</td></tr>
  </table>
  <h2 style="font-size:16px;margin:16px 0 6px">${m.rows.length === 1 ? 'Last cycle' : `Last ${m.rows.length} cycles`}</h2>
  <table style="border-collapse:collapse;width:100%">
    <thead><tr style="color:dimgray"><th style="${td}">Start</th><th style="${td}">Cycle (days)</th><th style="${td}">Period (days)</th><th style="${td}">Heaviest flow</th><th style="${td}">Max pain /10</th><th style="${td}">Most logged symptoms</th></tr></thead>
    <tbody>${rows || `<tr><td style="${td}" colspan="6">No cycles recorded.</td></tr>`}</tbody>
  </table>
  <h2 style="font-size:16px;margin:20px 0 6px">Patterns worth discussing</h2>
  ${m.flags.length ? `<ul style="margin:0;padding-left:20px">${m.flags.map(f => `<li>${FLAG_EN[f.type] ?? f.type}</li>`).join('')}</ul>` : '<p style="margin:0">None of the app’s checks were triggered.</p>'}
  <p style="margin-top:24px;color:dimgray;font-size:11px">${DISCLAIMER_EN}</p>
</div>`;
}

/**
 * PDF from the hidden HTML view. The view is drawn to a bitmap by html2canvas (the browser shapes
 * Devanagari correctly) and placed on A4 pages. jsPDF's own .html() text mode would use its
 * built-in Latin fonts and break Hindi names.
 */
export async function reportPdfBase64(m: ReportModel): Promise<string> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:white';
  host.innerHTML = reportHtml(m);
  document.body.appendChild(host);
  try {
    await document.fonts.ready;
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, { scale: 2, backgroundColor: 'white', logging: false });
    const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const slicePx = Math.floor(canvas.width * (pageH / pageW)); // canvas pixels that fit one page
    const page = document.createElement('canvas');
    page.width = canvas.width;
    for (let y = 0, i = 0; y < canvas.height; y += slicePx, i++) {
      const h = Math.min(slicePx, canvas.height - y);
      page.height = h;
      const ctx = page.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, page.width, h);
      ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (i > 0) doc.addPage();
      doc.addImage(page.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, (h * pageW) / canvas.width);
    }
    doc.setProperties({ title: `Cycle summary – ${m.name}`, creator: 'Ritu' });
    return doc.output('datauristring').split(',')[1];
  } finally {
    host.remove();
  }
}
