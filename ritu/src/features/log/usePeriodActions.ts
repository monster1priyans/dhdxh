import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, localToday, type ISODate } from '../../../shared/engine';
import { applyPeriodOp, snapshotPeriods } from '../../data/actions';
import { getProfile } from '../../data/profiles';
import { formatDate } from '../../lib/format';
import type { PeriodRec } from '../../data/types';
import { ongoingPeriod, periodOn, stretchTo, type PeriodLike, type PeriodOp } from '../../lib/periodRules';
import { likelyLochia } from '../../lib/stage';
import { toast, type ToastAction } from '../../store/toast';

/** "Period started" / "Period ended" with the "Edit the existing period instead?" question. */
export function usePeriodActions(pid: string, periods: PeriodRec[]) {
  const { t } = useTranslation();
  const [ask, setAsk] = useState<{ date: ISODate; nearby: PeriodLike } | null>(null);
  // a day soon after a birth that may be lochia rather than a period, waiting for her answer
  const [lochia, setLochia] = useState<ISODate | null>(null);
  const today = localToday();
  const ongoing = ongoingPeriod(periods, today);

  /** Apply a change and return the toast button that undoes it. */
  async function applyUndoable(op: PeriodOp): Promise<ToastAction> {
    const restore = await snapshotPeriods(pid);
    await applyPeriodOp(pid, op);
    return { label: t('toast.undo'), run: async () => { await restore(); toast(t('toast.undone')); } };
  }

  /** "Saved: period started 12 Sep. Next period likely 10 Oct." — read after the prediction is recalculated. */
  async function savedWithPrediction(date: ISODate, undo: ToastAction): Promise<void> {
    const profile = await getProfile(pid);
    const first = periods.length === 0 && profile?.firstPeriodPending;
    const saved = first ? t('toast.firstPeriod', { date: formatDate(date) })
      : date === today ? t('toast.periodStarted') : t('toast.periodFrom', { date: formatDate(date) });
    const next = profile?.mode !== 'pregnant' ? profile?.prediction?.cycles[0]?.start : undefined;
    toast(next ? `${saved}. ${t('toast.nextLikely', { date: formatDate(next) })}` : saved, undo);
  }

  async function start(date: ISODate = today, notLochia = false): Promise<void> {
    const { op, nearby } = periodOn(periods, date, today);
    if (op.type === 'none') { toast(t('toast.alreadyPeriod')); return; }
    if (!notLochia) {
      const profile = await getProfile(pid);
      if (profile && likelyLochia(profile, periods, date)) { setLochia(date); return; }
    }
    if (nearby) { setAsk({ date, nearby }); return; }
    await savedWithPrediction(date, await applyUndoable(await asStart(op, date)));
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
    toast(t('toast.periodEnded'), await applyUndoable({ type: 'update', id: ongoing.id, endDate: today }));
  }

  async function resolve(editExisting: boolean): Promise<void> {
    if (!ask) return;
    // "Edit the existing period" stretches it to cover the day; otherwise it is a new period after all
    const op: PeriodOp = editExisting
      ? stretchTo(ask.nearby, ask.date, today)
      : await asStart({ type: 'create', startDate: ask.date, endDate: null }, ask.date);
    const undo = await applyUndoable(op);
    setAsk(null);
    if (editExisting) toast(t('toast.saved'), undo);
    else await savedWithPrediction(ask.date, undo);
  }

  async function answerLochia(isPeriod: boolean): Promise<void> {
    const date = lochia;
    setLochia(null);
    if (date && isPeriod) await start(date, true);
  }

  return { ongoing, start, end, ask, resolve, cancelAsk: () => setAsk(null), lochia, answerLochia };
}
