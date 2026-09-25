import { useEffect, useState, type ReactNode } from 'react';
import type { BangleColour } from '../data/types';
import type { RingModel } from '../lib/cycle';

interface Props {
  size: number;
  colour: BangleColour;
  model: RingModel | null;
  locked?: boolean;
  /** the one signature moment: draw arcs and slide the today-bead in (skipped under reduced motion) */
  animate?: boolean;
  label: string;
  children?: ReactNode;
}

/** Her cycle drawn on a thick glossy bangle. */
export function BangleRing({ size, colour, model, locked = false, animate = false, label, children }: Props) {
  const [drawn, setDrawn] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const stroke = Math.max(5, size * 0.12);
  const r = size / 2 - stroke / 2 - Math.max(2, size * 0.03);
  const c = size / 2;
  const C = 2 * Math.PI * r;
  const total = model?.total ?? 28;
  const frac = (i: number) => i / total;
  const angleOf = (dayIdx: number) => (frac(dayIdx + 0.5) * 360);
  const beadPos = (dayIdx: number) => {
    const a = (angleOf(dayIdx) - 90) * (Math.PI / 180);
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  };
  const gap = size > 80 ? C * 0.004 : 0;

  const arc = (range: [number, number], colourVar: string, key: string) => {
    const startLen = frac(range[0]) * C + gap / 2;
    const len = Math.max(0, (range[1] - range[0] + 1) / total * C - gap);
    return (
      <circle
        key={key} cx={c} cy={c} r={r} fill="none" stroke={colourVar} strokeWidth={stroke * 0.78}
        strokeDasharray={`${drawn ? len : 0} ${C}`} strokeDashoffset={-startLen}
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray var(--dur-signature) var(--ease-out)' }}
      />
    );
  };

  const base = locked ? 'var(--line)' : `var(--bangle-${colour})`;
  const bead = Math.max(3, stroke * 0.42);
  const todayAngle = model?.today != null ? angleOf(Math.min(model.today, total - 1)) : null;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="absolute inset-0">
        {/* bangle body with gloss */}
        <circle cx={c} cy={c} r={r} fill="none" stroke={base} strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r + stroke * 0.36} fill="none" stroke="black" strokeOpacity={0.12} strokeWidth={stroke * 0.12} />
        <circle
          cx={c} cy={c} r={r - stroke * 0.18} fill="none" stroke="white" strokeOpacity={locked ? 0.2 : 0.38}
          strokeWidth={stroke * 0.18} strokeLinecap="round"
          strokeDasharray={`${C * 0.22} ${C}`} transform={`rotate(-200 ${c} ${c})`}
        />
        {!locked && model && (
          <>
            {model.period.map((rg, i) => arc(rg, 'var(--period)', `p${i}`))}
            {model.fertile.map((rg, i) => arc(rg, 'var(--fertile)', `f${i}`))}
            {model.ovulation !== null && (() => {
              const p = beadPos(model.ovulation);
              return (
                <g style={{ opacity: drawn ? 1 : 0, transition: 'opacity var(--dur-signature) var(--ease-out)' }}>
                  <circle cx={p.x} cy={p.y} r={bead} fill="var(--fertile)" stroke="var(--surface)" strokeWidth={Math.max(1, bead * 0.35)} />
                  <circle cx={p.x - bead * 0.3} cy={p.y - bead * 0.3} r={bead * 0.3} fill="white" fillOpacity={0.7} />
                </g>
              );
            })()}
            {todayAngle !== null && (
              <g
                style={{
                  transform: `rotate(${drawn ? todayAngle : 0}deg)`, transformOrigin: `${c}px ${c}px`, transformBox: 'view-box',
                  transition: 'transform var(--dur-signature) var(--ease-out)',
                }}
              >
                <circle cx={c} cy={c - r} r={bead * 1.15} fill="white" stroke="var(--ink)" strokeWidth={Math.max(1.5, bead * 0.4)} />
              </g>
            )}
          </>
        )}
      </svg>
      {children && <div className="relative flex flex-col items-center text-center">{children}</div>}
    </div>
  );
}
