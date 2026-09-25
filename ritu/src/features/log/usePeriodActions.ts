import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, localToday, type ISODate } from '../../../shared/engine';
import { applyPeriodOp } from '../../data/actions';
import { getProfile } from '../../data/profiles';
import { formatDate } from '../../lib/format';
import type { PeriodRec } from '../../data/types';
import { ongoingPeriod, periodOn, stretchTo, type PeriodLike, type PeriodOp } from '../../lib/periodRules';
import { toast } from '../../store/toast';

/** "Period started" / "Period ended" with the "Edit the existing period instead?" question. */
export function usePeriodActions(pid: string, periods: PeriodRec[]) {
  const { t } = useTranslation();
  const [ask, setAsk] = useState<{ date: ISODate; nearby: PeriodLike } | null>(null);
  const today = localToday();
  const ongoing = ongoingPeriod(periods, today);

  /** "Saved: period started 12 Sep. Next period likely 10 Oct." — read after the prediction is recalculated. */
  async function savedWithPrediction(date: ISODate): Promise<void> {
    const saved = date === today ? t('toast.periodStarted') : t('toast.periodFrom', { date: formatDate(date) });
    const profile = await getProfile(pid);
    const next = profile?.mode !== 'pregnant' ? profile?.prediction?.cycles[0]?.start : undefined;
    toast(next ? `${saved}. ${t('toast.nextLikely', { date: formatDate(next) })}` : saved);
  }

  async function start(date: ISODate = today): Promise<void> {
    const { op, nearby } = periodOn(periods, date, today);
    if (op.type === 'none') { toast(t('toast.alreadyPeriod')); return; }
    if (nearby) { setAsk({ date, nearby }); return; }
    await applyPeriodOp(pid, await asStart(op, date));
    await savedWithPrediction(date);
  }

  /** A new period picked by its start day lasts her usual length; one that would still be going is left open. */
  async function asStart(op: PeriodOp, date: ISODate): Promise<PeriodOp> {
    if (op.type !== 'create') return op;
    const len = (await getProfile(pid))?.settings.periodLen ?? 5;
    const end = addDays(date, len - 1);
    return { ...op, endDate: end < today ? end : null };
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
      : await asStart({ type: 'create', startDate: ask.date, endDate: null }, ask.date);
    await applyPeriodOp(pid, op);
    setAsk(null);
    if (editExisting) toast(t('toast.saved'));
    else await savedWithPrediction(ask.date);
  }

  return { ongoing, start, end, ask, resolve, cancelAsk: () => setAsk(null) };
}
