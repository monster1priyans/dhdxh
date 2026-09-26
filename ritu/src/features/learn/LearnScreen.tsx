import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { LEARN, type Field, type Segment } from './content';

const TONE: Record<Segment['tone'], string> = {
  period: 'bg-period text-white',
  ovulation: 'bg-fertile text-white',
  early: 'bg-primary/15 text-ink',
  late: 'bg-flag-tint text-ink',
};

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mx-4 mb-4 flex scroll-mt-4 flex-col gap-3 rounded-2xl bg-surface p-4">
      <h2 id={`${id}-h`} className="text-xl text-balance">{title}</h2>
      {children}
    </section>
  );
}

function Fields({ fields }: { fields: Field[] }) {
  return (
    <dl className="flex flex-col gap-3">
      {fields.map(f => (
        <div key={f.label}>
          <dt className="text-sm font-medium text-ink-2">{f.label}</dt>
          <dd className="max-w-prose">{f.text}</dd>
        </div>
      ))}
    </dl>
  );
}

function Track({ label, segments, dayLabel }: { label: string; segments: Segment[]; dayLabel: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="grid h-9 gap-px overflow-hidden rounded-lg" style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }}>
        {segments.map(s => (
          <div
            key={s.label} title={`${s.label}: ${dayLabel} ${s.from}${s.to !== s.from ? `–${s.to}` : ''}`}
            className={`flex items-center justify-center overflow-hidden px-1 text-xs font-medium ${TONE[s.tone]}`}
            style={{ gridColumn: `${s.from} / ${s.to + 1}` }}
          >
            {s.to - s.from >= 3 && <span className="truncate">{s.label}</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-2">
        {segments.map(s => `${s.label} ${s.from}${s.to !== s.from ? `–${s.to}` : ''}`).join(' · ')}
      </p>
    </div>
  );
}

export function LearnScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const c = LEARN[i18n.language === 'hi' ? 'hi' : 'en'];

  const toc = [
    { id: 'overview', title: c.overview.title },
    { id: 'timeline', title: c.timeline.title },
    { id: 'phases', title: c.phasesTitle },
    { id: 'outcomes', title: c.outcomes.title },
    { id: 'hormones', title: c.hormones.title },
    { id: 'variation', title: c.variation.title },
    { id: 'care', title: c.care.title },
  ];
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <article className="pb-8">
      <header className="flex items-center gap-1 px-2 pt-2">
        <button type="button" onClick={() => navigate(-1)} className="grid size-11 shrink-0 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="text-2xl text-balance">{c.title}</h1>
      </header>
      <p className="mx-4 mt-2 mb-4 max-w-prose text-ink-2">{c.intro}</p>

      <nav aria-label={c.contents} className="mx-4 mb-4 rounded-2xl bg-surface p-4">
        <h2 className="mb-1 text-sm font-medium text-ink-2">{c.contents}</h2>
        <ul className="flex flex-col">
          {toc.map(item => (
            <li key={item.id}>
              <button type="button" onClick={() => jump(item.id)} className="min-h-11 w-full text-left text-primary">{item.title}</button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-4 mb-4 flex gap-3 rounded-2xl bg-flag-tint p-4" role="note">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-flag" />
        <div>
          <h2 className="font-medium">{c.simplified.title}</h2>
          <p className="max-w-prose">{c.simplified.text}</p>
        </div>
      </div>

      <figure className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <h2 className="text-xl">{c.diagram.title}</h2>
        <Track label={c.diagram.ovarian} segments={c.diagram.ovarianSegments} dayLabel={c.diagram.dayLabel} />
        <Track label={c.diagram.uterine} segments={c.diagram.uterineSegments} dayLabel={c.diagram.dayLabel} />
        <p className="text-xs font-medium text-ink-2">{c.diagram.dayLabel}</p>
        <div className="-mt-2 grid text-xs text-ink-2 tabular-nums" style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }} aria-hidden>
          {[1, 7, 14, 21, 28].map(d => <span key={d} style={{ gridColumn: `${d} / ${d + 1}` }} className="text-center">{d}</span>)}
        </div>
        <figcaption className="text-sm text-ink-2">{c.diagram.caption}</figcaption>
      </figure>

      <Card id="overview" title={c.overview.title}>
        {c.overview.paragraphs.map(p => <p key={p} className="max-w-prose">{p}</p>)}
      </Card>

      <Card id="timeline" title={c.timeline.title}>
        <p className="max-w-prose font-medium">{c.timeline.dayOne}</p>
        <p className="max-w-prose text-ink-2">{c.timeline.note}</p>
        <p className="text-sm text-ink-2 md:hidden" aria-hidden>{c.timeline.swipe}</p>
        <div className="-mx-4 overflow-x-auto px-4" tabIndex={0} role="region" aria-label={c.timeline.swipe}>
          <table className="w-[60rem] border-collapse text-left text-sm">
            <caption className="sr-only">{c.timeline.note}</caption>
            <thead>
              <tr className="border-b-2 border-line align-bottom">
                {c.timeline.columns.map((col, i) => (
                  <th key={col} scope="col" className={`p-2 font-medium text-ink-2 ${i === 0 ? 'sticky left-0 bg-surface' : ''}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.timeline.rows.map(row => (
                <tr key={row[0]} className="border-b border-line align-top">
                  {row.map((cell, i) => i === 0
                    ? <th key={i} scope="row" className="sticky left-0 w-24 bg-surface p-2 font-medium whitespace-nowrap">{cell}</th>
                    : <td key={i} className="p-2">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <section id="phases" aria-labelledby="phases-h" className="scroll-mt-4">
        <h2 id="phases-h" className="mx-4 mb-3 text-xl">{c.phasesTitle}</h2>
        {c.phases.map(ph => (
          <section key={ph.id} aria-labelledby={`${ph.id}-h`} className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl bg-surface p-4">
            <h3 id={`${ph.id}-h`} className="font-display text-lg font-semibold text-balance">{ph.title}</h3>
            <Fields fields={ph.fields} />
          </section>
        ))}
      </section>

      <Card id="outcomes" title={c.outcomes.title}>
        <Fields fields={c.outcomes.items} />
      </Card>

      <Card id="hormones" title={c.hormones.title}>
        <dl className="flex flex-col gap-3">
          {c.hormones.items.map(h => (
            <div key={h.name}>
              <dt><span className="font-medium">{h.name}</span> <span className="text-sm text-ink-2">({h.full})</span></dt>
              <dd className="max-w-prose">{h.text}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-2 font-medium">{c.hormones.sequenceTitle}</h3>
        <ol className="flex flex-col gap-1.5">
          {c.hormones.sequence.map((s, i) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-medium tabular-nums">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card id="variation" title={c.variation.title}>
        <p className="max-w-prose">{c.variation.intro}</p>
        <Fields fields={c.variation.items} />
        <div className="flex gap-3 rounded-xl bg-flag-tint p-3" role="note">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-flag" />
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{c.variation.notesTitle}</h3>
            {c.variation.notes.map(n => <p key={n} className="max-w-prose">{n}</p>)}
          </div>
        </div>
      </Card>

      <Card id="care" title={c.care.title}>
        <p className="max-w-prose">{c.care.intro}</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          {c.care.items.map(item => <li key={item} className="max-w-prose">{item}</li>)}
        </ul>
        <p className="max-w-prose font-medium">{c.care.outro}</p>
      </Card>

      <Card id="summary" title={c.summary.title}>
        <p className="max-w-prose">{c.summary.text}</p>
      </Card>

      <section className="mx-4 flex flex-col gap-2 text-sm text-ink-2" aria-labelledby="sources-h">
        <h2 id="sources-h" className="font-medium">{c.sources.title}</h2>
        <p>{c.sources.intro}</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">{c.sources.items.map(s => <li key={s}>{s}</li>)}</ul>
        <p>{t('disclaimer')}</p>
      </section>
    </article>
  );
}
