import { useTranslation } from 'react-i18next';
import type { TempPoint, TempShift } from '../lib/temp';

interface Props { points: TempPoint[]; lhDays: { day: number }[]; shift: TempShift | null; cycleLen: number }

/** Morning temperatures across the current cycle, drawn by hand so the Today screen stays light. */
export function TempChart({ points, lhDays, shift, cycleLen }: Props) {
  const { t } = useTranslation();
  const W = 320, H = 170, L = 34, R = 8, T = 10, B = 24;
  const maxDay = Math.max(cycleLen, ...points.map(p => p.day), ...lhDays.map(d => d.day));
  const temps = points.map(p => p.temp);
  const lo = Math.floor((Math.min(...temps, shift?.coverLine ?? 99) - 0.1) * 10) / 10;
  const hi = Math.ceil((Math.max(...temps, shift?.coverLine ?? 0) + 0.1) * 10) / 10;
  const x = (day: number) => L + ((day - 1) / Math.max(1, maxDay - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / Math.max(0.1, hi - lo)) * (H - T - B);
  const ticks = [lo, (lo + hi) / 2, hi].map(v => Math.round(v * 10) / 10);
  const dayTicks = [1, Math.round(maxDay / 2), maxDay];
  const summary = t('ttc.chartLabel', {
    count: points.length, min: Math.min(...temps).toFixed(2), max: Math.max(...temps).toFixed(2),
  });

  return (
    <figure className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={summary}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={L - 4} y={y(v) + 4} textAnchor="end" fontSize={10} fill="var(--ink-2)">{v.toFixed(1)}</text>
          </g>
        ))}
        {dayTicks.map(d => (
          <text key={d} x={x(d)} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--ink-2)">{d}</text>
        ))}
        {lhDays.map(d => (
          <rect key={d.day} x={x(d.day) - 4} y={T} width={8} height={H - T - B} rx={3} fill="var(--fertile-tint)" />
        ))}
        {shift && (
          <line x1={L} x2={W - R} y1={y(shift.coverLine)} y2={y(shift.coverLine)} stroke="var(--primary)" strokeDasharray="4 3" strokeWidth={1.5} />
        )}
        <polyline
          points={points.map(p => `${x(p.day)},${y(p.temp)}`).join(' ')}
          fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="round"
        />
        {points.map(p => (
          <circle key={p.date} cx={x(p.day)} cy={y(p.temp)} r={3.2}
            fill={shift && p.date >= shift.date ? 'var(--primary)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth={1.2} />
        ))}
      </svg>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
        <span>{t('ttc.axis')}</span>
        {lhDays.length > 0 && <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block size-3 rounded-sm bg-fertile-tint" />{t('ttc.legendLh')}</span>}
        {shift && <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0 w-4 border-t-2 border-dashed border-primary" />{t('ttc.legendCover')}</span>}
      </figcaption>
    </figure>
  );
}
