import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { localToday, type ISODate, type Mode } from '../../../shared/engine';
import { changeProfile } from '../../data/actions';
import type { PregnancyOutcome, Profile } from '../../data/types';
import { toast } from '../../store/toast';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';

type Choice = PregnancyOutcome | 'mistake';

interface Props {
  profile: Profile;
  /** the mode to switch to when leaving pregnancy mode */
  nextMode?: Exclude<Mode, 'pregnant'>;
  /** change the saved date or outcome instead of ending a pregnancy */
  editing?: boolean;
  onClose: () => void;
}

/**
 * How a pregnancy ended. A birth or a loss starts her cycle history afresh from that day, so Ritu doesn't
 * count her as "250 days late"; choosing "Pregnant" by mistake just switches back. Mount it only while open.
 */
export function EndPregnancySheet({ profile, nextMode = 'track', editing = false, onClose }: Props) {
  const { t } = useTranslation();
  const today = localToday();
  const [choice, setChoice] = useState<Choice | null>(editing ? profile.pregnancyEnd?.outcome ?? null : null);
  const [date, setDate] = useState<ISODate>(editing ? profile.pregnancyEnd?.date ?? today : today);
  const [saving, setSaving] = useState(false);
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today;
  const ready = choice === 'mistake' || (choice !== null && dateOk);

  async function save() {
    if (!choice || !ready) return;
    setSaving(true);
    const before = { mode: profile.mode, dueDate: profile.dueDate, pregnancyEnd: profile.pregnancyEnd };
    const end = choice === 'mistake' ? null : { date, outcome: choice };
    await changeProfile(profile.id, editing
      ? { pregnancyEnd: end }
      : { mode: nextMode, dueDate: null, ...(end ? { pregnancyEnd: end } : {}) });
    onClose();
    toast(t('toast.saved'), { label: t('toast.undo'), run: async () => { await changeProfile(profile.id, before); toast(t('toast.undone')); } });
  }

  const options: { value: Choice; label: string; hint?: string }[] = [
    { value: 'birth', label: t('endPregnancy.birth') },
    { value: 'loss', label: t('endPregnancy.loss'), hint: t('endPregnancy.lossHint') },
    { value: 'mistake', label: editing ? t('endPregnancy.remove') : t('endPregnancy.mistake'), hint: editing ? t('endPregnancy.removeHint') : undefined },
  ];

  return (
    <BottomSheet open onClose={onClose} title={editing ? t('endPregnancy.editTitle') : t('endPregnancy.title')}
      footer={<Button className="w-full" disabled={!ready || saving} onClick={() => void save()}>{t('common.save')}</Button>}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={editing ? t('endPregnancy.editTitle') : t('endPregnancy.title')}>
          {options.map(o => (
            <button key={o.value} type="button" role="radio" aria-checked={choice === o.value} onClick={() => setChoice(o.value)}
              className={`flex min-h-12 flex-col items-start justify-center rounded-xl border-2 px-3 py-2 text-left transition-colors duration-150 ${choice === o.value ? 'border-primary' : 'border-line'}`}>
              <span className="font-medium">{o.label}</span>
              {o.hint && <span className="text-sm text-ink-2">{o.hint}</span>}
            </button>
          ))}
        </div>
        {(choice === 'birth' || choice === 'loss') && (
          <label className="flex flex-col gap-1.5">
            <span className="font-medium">{choice === 'birth' ? t('endPregnancy.birthDate') : t('endPregnancy.lossDate')}</span>
            <input type="date" max={today} value={date} onChange={e => setDate(e.target.value)}
              className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg" />
          </label>
        )}
        {(choice === 'birth' || choice === 'loss') && !dateOk && <p className="text-sm text-period" role="alert">{t('history.error_future')}</p>}
        <p className="text-sm text-ink-2">{choice === 'mistake' ? (editing ? t('endPregnancy.removeNote') : t('endPregnancy.mistakeNote')) : t('endPregnancy.note')}</p>
      </div>
    </BottomSheet>
  );
}
