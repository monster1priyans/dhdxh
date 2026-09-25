import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { localToday, type ISODate } from '../../../shared/engine';
import { applyPeriodOp } from '../../data/actions';
import type { PeriodRec } from '../../data/types';
import { ongoingPeriod, periodOn, stretchTo, type PeriodLike, type PeriodOp } from '../../lib/periodRules';
import { toast } from '../../store/toast';

/** "Period started" / "Period ended" with the "Edit the existing period instead?" question. */
export function usePeriodActions(pid: string, periods: PeriodRec[]) {
  const { t } = useTranslation();
  const [ask, setAsk] = useState<{ date: ISODate; nearby: PeriodLike } | null>(null);
  const today = localToday();
  const ongoing = ongoingPeriod(periods, today);

  async function start(date: ISODate = today): Promise<void> {
    const { op, nearby } = periodOn(periods, date, today);
    if (nearby) { setAsk({ date, nearby }); return; }
    await applyPeriodOp(pid, op);
    toast(date === today ? t('toast.periodStarted') : t('toast.saved'));
  }

  async function end(): Promise<void> {
    if (!ongoing) return;
    await applyPeriodOp(pid, { type: 'update', id: ongoing.id, endDate: today });
    toast(t('toast.periodEnded'));
  }

  async function resolve(editExisting: boolean): Promise<void> {
    if (!ask) return;
    // "Edit the existing period" stretches it to cover the day; otherwise it is a new period after all
    const op: PeriodOp = editExisting
      ? stretchTo(ask.nearby, ask.date, today)
      : { type: 'create', startDate: ask.date, endDate: ask.date === today ? null : ask.date };
    await applyPeriodOp(pid, op);
    setAsk(null);
    toast(ask.date === today && !editExisting ? t('toast.periodStarted') : t('toast.saved'));
  }

  return { ongoing, start, end, ask, resolve, cancelAsk: () => setAsk(null) };
}
