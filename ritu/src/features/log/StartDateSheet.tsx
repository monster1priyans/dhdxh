import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, localToday, type ISODate } from '../../../shared/engine';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';

interface Props { open: boolean; name: string; onClose: () => void; onPick: (date: ISODate) => Promise<void> }

/** "Started on another day": pick the first day of a period; the prediction is recalculated on save. */
export function StartDateSheet({ open, name, onClose, onPick }: Props) {
  const { t } = useTranslation();
  const today = localToday();
  const [date, setDate] = useState<ISODate>(today);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setDate(localToday()); }, [open]);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today;

  return (
    <BottomSheet
      open={open} onClose={onClose} title={t('startDate.title', { name })}
      footer={
        <Button className="w-full" disabled={!valid || saving} onClick={async () => {
          setSaving(true);
          try { await onPick(date); onClose(); } finally { setSaving(false); }
        }}>{t('startDate.save')}</Button>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">{t('startDate.label')}</span>
          <input
            id="period-start-date" type="date" max={today} value={date}
            onChange={e => setDate(e.target.value)}
            className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('startDate.quick')}>
          {[0, 1, 2, 3].map(n => {
            const d = addDays(today, -n);
            return (
              <button key={n} type="button" aria-pressed={date === d} onClick={() => setDate(d)}
                className={`min-h-11 rounded-full border px-3.5 transition-colors duration-150 ${date === d ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink'}`}>
                {n === 0 ? t('startDate.today') : n === 1 ? t('startDate.yesterday') : t('startDate.daysAgo', { count: n })}
              </button>
            );
          })}
        </div>
        {!valid && <p className="text-sm text-period" role="alert">{t('startDate.future')}</p>}
        <p className="text-sm text-ink-2">{t('startDate.hint')}</p>
      </div>
    </BottomSheet>
  );
}
