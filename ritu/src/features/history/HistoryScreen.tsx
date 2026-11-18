import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, History as HistoryIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { addDays, localToday, type ISODate } from '../../../shared/engine';
import { applyPeriodOp, snapshotPeriods } from '../../data/actions';
import type { PeriodRec, Profile } from '../../data/types';
import { useProfileData } from '../../hooks/useProfileData';
import { formatDate } from '../../lib/format';
import { historyRows, validatePeriodEdit, type HistoryRow, type PeriodOp } from '../../lib/periodRules';
import { useProfile } from '../../store/profiles';
import { toast } from '../../store/toast';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { ConfirmSheet } from '../../components/ConfirmSheet';
import { EmptyState } from '../../components/EmptyState';
import { PinGate } from '../../components/PinGate';
import { Switch } from '../../components/Switch';

export function HistoryScreen() {
  const { pid } = useParams();
  const profile = useProfile(pid);
  const { t } = useTranslation();
  if (!profile) return <p className="p-6 text-center text-ink-2">{t('profile.notFound')} <Link className="text-primary" to="/">{t('tabs.home')}</Link></p>;
  return <PinGate profile={profile}><PeriodHistory profile={profile} /></PinGate>;
}

type Editing = { id?: string; start: ISODate; end: ISODate | null } | null;

function PeriodHistory({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { periods, loaded } = useProfileData(profile.id);
  const today = localToday();
  const rows = historyRows(periods, today);
  const longest = Math.max(1, ...rows.map(r => r.cycleDays ?? r.periodDays), profile.settings.cycleLen);
  const [editing, setEditing] = useState<Editing>(null);
  const [removing, setRemoving] = useState<PeriodRec | null>(null);

  /** Every change here can be undone from the toast. */
  async function apply(op: PeriodOp, message: string) {
    const restore = await snapshotPeriods(profile.id);
    await applyPeriodOp(profile.id, op);
    toast(message, { label: t('toast.undo'), run: async () => { await restore(); toast(t('toast.undone')); } });
  }

  return (
    <div className="pb-6">
      <header className="flex items-center gap-1 px-2 pt-2 pb-2">
        <button type="button" onClick={() => navigate(-1)} className="grid size-11 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="flex-1 truncate text-2xl">{t('history.title', { name: profile.name })}</h1>
      </header>

      <div className="mx-4 mb-4 flex flex-col gap-3">
        <p className="text-ink-2">{t('history.intro')}</p>
        <Button className="self-start" onClick={() => setEditing({ start: addDays(today, -profile.settings.cycleLen), end: addDays(today, -profile.settings.cycleLen + profile.settings.periodLen - 1) })}>
          <Plus aria-hidden className="size-4" />{t('history.add')}
        </Button>
      </div>

      {loaded && rows.length === 0 && <EmptyState icon={HistoryIcon} title={t('history.empty')} />}

      <ol className="mx-4 flex flex-col gap-3">
        {rows.map(r => (
          <li key={r.period.id}>
            <Row row={r} longest={longest}
              onEdit={() => setEditing({ id: r.period.id, start: r.period.startDate, end: r.period.endDate })}
              onDelete={() => setRemoving(r.period as PeriodRec)} />
          </li>
        ))}
      </ol>

      <EditSheet
        editing={editing} periods={periods} onClose={() => setEditing(null)}
        onSave={async e => {
          const op: PeriodOp = e.id
            ? { type: 'update', id: e.id, startDate: e.start, endDate: e.end }
            : { type: 'create', startDate: e.start, endDate: e.end };
          setEditing(null);
          await apply(op, t('toast.saved'));
        }}
      />
      <ConfirmSheet
        open={removing !== null} onClose={() => setRemoving(null)} title={t('history.deleteTitle')}
        body={removing ? t('history.deleteBody', { from: formatDate(removing.startDate), to: removing.endDate ? formatDate(removing.endDate) : t('history.ongoing') }) : ''}
        actions={[
          { label: t('history.delete'), variant: 'danger', onClick: () => {
            const id = removing!.id;
            setRemoving(null);
            void apply({ type: 'delete', id }, t('history.deleted'));
          } },
          { label: t('common.cancel'), onClick: () => setRemoving(null) },
        ]}
      />
    </div>
  );
}

/** A period as a strip: the bleeding days in red, the rest of its cycle as a pale track. */
function Row({ row, longest, onEdit, onDelete }: { row: HistoryRow; longest: number; onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  const p = row.period;
  const total = row.cycleDays ?? row.periodDays;
  const range = p.endDate === p.startDate ? formatDate(p.startDate)
    : `${formatDate(p.startDate)} – ${p.endDate ? formatDate(p.endDate) : t('history.ongoing')}`;
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-medium">{range}</p>
          <p className="text-sm text-ink-2">
            {t('history.periodDays', { count: row.periodDays })}
            {row.cycleDays !== null && ` · ${t('history.cycleDays', { count: row.cycleDays })}`}
          </p>
        </div>
        <button type="button" onClick={onEdit} className="grid size-11 place-items-center rounded-full" aria-label={t('history.editOne', { range })}>
          <Pencil aria-hidden className="size-5" />
        </button>
        <button type="button" onClick={onDelete} className="grid size-11 place-items-center rounded-full text-period" aria-label={t('history.deleteOne', { range })}>
          <Trash2 aria-hidden className="size-5" />
        </button>
      </div>
      <div aria-hidden className="flex h-2.5 overflow-hidden rounded-full bg-line" style={{ width: `${Math.max(12, (total / longest) * 100)}%` }}>
        <div className="h-full bg-period" style={{ width: `${Math.min(100, (row.periodDays / total) * 100)}%` }} />
      </div>
    </div>
  );
}

function EditSheet({ editing, periods, onClose, onSave }: {
  editing: Editing; periods: PeriodRec[]; onClose: () => void; onSave: (e: NonNullable<Editing>) => Promise<void>;
}) {
  const { t } = useTranslation();
  const today = localToday();
  const [start, setStart] = useState<ISODate>(today);
  const [end, setEnd] = useState<ISODate>(today);
  const [ongoing, setOngoing] = useState(false);
  useEffect(() => {
    if (!editing) return;
    setStart(editing.start);
    setEnd(editing.end ?? today);
    setOngoing(editing.end === null);
  }, [editing]);

  const wellFormed = /^\d{4}-\d{2}-\d{2}$/.test(start) && (ongoing || /^\d{4}-\d{2}-\d{2}$/.test(end));
  const edit = { id: editing?.id, start, end: ongoing ? null : end };
  const error = wellFormed ? validatePeriodEdit(periods, edit, today) : 'order';
  const input = 'min-h-12 rounded-xl border border-line bg-surface px-3 text-lg';

  return (
    <BottomSheet open={editing !== null} onClose={onClose} title={editing?.id ? t('history.editTitle') : t('history.addTitle')}
      footer={<Button className="w-full" disabled={error !== null} onClick={() => void onSave(edit)}>{t('common.save')}</Button>}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">{t('history.start')}</span>
          <input type="date" max={today} value={start} onChange={e => setStart(e.target.value)} className={input} />
        </label>
        <div className="rounded-2xl border border-line p-3">
          <Switch label={t('history.stillGoing')} checked={ongoing} onChange={setOngoing} />
        </div>
        {!ongoing && (
          <label className="flex flex-col gap-1.5">
            <span className="font-medium">{t('history.end')}</span>
            <input type="date" min={start} max={today} value={end} onChange={e => setEnd(e.target.value)} className={input} />
          </label>
        )}
        {error && <p className="text-sm text-period" role="alert">{t(`history.error_${error}`)}</p>}
      </div>
    </BottomSheet>
  );
}
