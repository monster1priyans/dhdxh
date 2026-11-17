import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Check } from 'lucide-react';
import { localToday, type ISODate } from '../../../shared/engine';
import { changeProfile } from '../../data/actions';
import type { Profile } from '../../data/types';
import { formatDate } from '../../lib/format';
import { CHECKUPS, checkupState, dueFromLastPeriod, gestation, isPlausibleDueDate } from '../../lib/pregnancy';
import { toast } from '../../store/toast';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { EndPregnancySheet } from '../stages/EndPregnancySheet';

/** Pregnancy mode: week and trimester from the due date, a general check-up guide, and a way back to tracking. */
export function PregnancyCard({ profile, lastPeriod }: { profile: Profile; lastPeriod: ISODate | null }) {
  const { t } = useTranslation();
  const today = localToday();
  const [editDue, setEditDue] = useState(false);
  const [ending, setEnding] = useState(false);
  const g = profile.dueDate ? gestation(profile.dueDate, today) : null;

  return (
    <section className="mx-4 mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-4" aria-labelledby="preg-title">
      <h2 id="preg-title" className="flex items-center gap-2 text-xl">
        <Baby aria-hidden className="size-5 text-primary" />{t('pregnancy.title')}
      </h2>

      {!g || !profile.dueDate ? (
        <>
          <p className="text-ink-2">{t('pregnancy.noDue')}</p>
          <Button className="self-start" onClick={() => setEditDue(true)}>{t('pregnancy.addDue')}</Button>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-3xl font-semibold">{t('pregnancy.weeksDays', { weeks: g.weeks, days: g.extraDays })}</p>
            <p className="font-medium text-ink-2">{t('pregnancy.trimester', { n: g.trimester })}</p>
          </div>
          <div
            role="progressbar" aria-valuemin={0} aria-valuemax={40} aria-valuenow={Math.min(40, g.weeks)}
            aria-label={t('pregnancy.progress')} className="h-3 overflow-hidden rounded-full bg-line"
          >
            <div className="h-full rounded-full" style={{ width: `${g.progress * 100}%`, background: `var(--bangle-${profile.colour})` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>
              {t('pregnancy.due', { date: formatDate(profile.dueDate, { day: 'numeric', month: 'long', year: 'numeric' }) })}
              <span className="block text-sm text-ink-2">
                {g.daysLeft > 0 ? t('pregnancy.daysLeft', { count: g.daysLeft }) : g.daysLeft === 0 ? t('pregnancy.dueToday') : t('pregnancy.pastDue', { count: -g.daysLeft })}
              </span>
            </p>
            <Button variant="secondary" onClick={() => setEditDue(true)}>{t('pregnancy.changeDue')}</Button>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{t('pregnancy.checkups')}</h3>
            <ul className="flex flex-col divide-y divide-line">
              {CHECKUPS.map(c => {
                const state = checkupState(c, g.weeks);
                return (
                  <li key={c.id} className={`flex items-start gap-3 py-2 ${state === 'past' ? 'text-ink-2' : ''}`}>
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${state === 'now' ? 'border-primary bg-primary text-on-primary' : 'border-line'}`} aria-hidden>
                      {state === 'past' && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block">{t(`checkup.${c.id}`)}</span>
                      <span className="block text-sm text-ink-2">
                        {t('pregnancy.weeksRange', { from: c.from, to: c.to })}
                        {state === 'now' && <strong className="ml-2 font-medium text-primary">{t('pregnancy.now')}</strong>}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-ink-2">{t('pregnancy.checkupNote')}</p>
          </div>
        </>
      )}

      <Button variant="ghost" className="self-start" onClick={() => setEnding(true)}>{t('pregnancy.ended')}</Button>

      {editDue && <DueDateSheet
        open current={profile.dueDate} lastPeriod={lastPeriod} onClose={() => setEditDue(false)}
        onSave={async dueDate => { setEditDue(false); await changeProfile(profile.id, { dueDate }); toast(t('toast.saved')); }}
      />}
      {ending && <EndPregnancySheet profile={profile} onClose={() => setEnding(false)} />}
    </section>
  );
}

function DueDateSheet({ open, current, lastPeriod, onClose, onSave }: {
  open: boolean; current: ISODate | null; lastPeriod: ISODate | null; onClose: () => void; onSave: (d: ISODate) => Promise<void>;
}) {
  const { t } = useTranslation();
  const today = localToday();
  // mounted fresh each time it opens, so these start from the saved values
  const [how, setHow] = useState<'due' | 'lmp'>(current || !lastPeriod ? 'due' : 'lmp');
  const [due, setDue] = useState<ISODate>(current ?? '');
  const [lmp, setLmp] = useState<ISODate>(lastPeriod ?? '');

  const iso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const result = how === 'due' ? (iso(due) ? due : null) : (iso(lmp) && lmp <= today ? dueFromLastPeriod(lmp) : null);
  const valid = result !== null && isPlausibleDueDate(result, today);
  const touched = how === 'due' ? due !== '' : lmp !== '';
  const input = 'min-h-12 rounded-xl border border-line bg-surface px-3 text-lg';
  const seg = (on: boolean) => `min-h-11 flex-1 rounded-full border px-3 transition-colors duration-150 ${on ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink'}`;

  return (
    <BottomSheet open={open} onClose={onClose} title={t('pregnancy.dueTitle')}
      footer={<Button className="w-full" disabled={!valid} onClick={() => result && void onSave(result)}>{t('common.save')}</Button>}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('pregnancy.dueTitle')}>
          <button type="button" aria-pressed={how === 'due'} className={seg(how === 'due')} onClick={() => setHow('due')}>{t('pregnancy.knowDue')}</button>
          <button type="button" aria-pressed={how === 'lmp'} className={seg(how === 'lmp')} onClick={() => setHow('lmp')}>{t('pregnancy.fromLmp')}</button>
        </div>
        {how === 'due' ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-medium">{t('pregnancy.dueLabel')}</span>
            <input type="date" value={due} onChange={e => setDue(e.target.value)} className={input} />
          </label>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="font-medium">{t('pregnancy.lmpLabel')}</span>
            <input type="date" max={today} value={lmp} onChange={e => setLmp(e.target.value)} className={input} />
          </label>
        )}
        {valid && result && how === 'lmp' && <p className="font-medium">{t('pregnancy.due', { date: formatDate(result, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>}
        {touched && !valid && <p className="text-sm text-period" role="alert">{t('pregnancy.dueInvalid')}</p>}
        <p className="text-sm text-ink-2">{t('pregnancy.dueHint')}</p>
      </div>
    </BottomSheet>
  );
}
