import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, FileText, KeyRound, Trash2 } from 'lucide-react';
import { changeProfile } from '../../data/actions';
import { deleteProfile } from '../../data/profiles';
import { listReminders, saveReminder } from '../../data/reminders';
import { onChange } from '../../data/db';
import type { Profile, ReminderRec } from '../../data/types';
import type { Mode } from '../../../shared/engine';
import { localToday } from '../../../shared/engine';
import { exportProfile } from '../../lib/backup';
import { logsCsv, periodsCsv, profileJson } from '../../lib/export';
import { deliverFiles, safeFileName } from '../../lib/files';
import { notificationsAllowed, remindersSupported, requestNotificationPermission, rescheduleAll } from '../../lib/notifications';
import { useProfile } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { toast } from '../../store/toast';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PinGate } from '../../components/PinGate';
import { PinPad } from '../../components/PinPad';
import { Stepper } from '../../components/Stepper';
import { Switch } from '../../components/Switch';
import { ColourPicker } from '../onboarding/Onboarding';
import { useDoctorReport } from '../insights/useDoctorReport';

export function ProfileSettingsScreen() {
  const { pid } = useParams();
  const profile = useProfile(pid);
  const { t } = useTranslation();
  if (!profile) return <p className="p-6 text-center text-ink-2">{t('profile.notFound')} <Link className="text-primary" to="/">{t('tabs.home')}</Link></p>;
  return <PinGate profile={profile}><Settings profile={profile} /></PinGate>;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Settings({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name);
  const [birth, setBirth] = useState(profile.birthYear ? String(profile.birthYear) : '');
  const thisYear = new Date().getFullYear();
  const birthYear = birth ? Number(birth) : null;
  const birthValid = !birth || (/^\d{4}$/.test(birth) && birthYear! >= 1930 && birthYear! <= thisYear);
  const s = profile.settings;
  const set = (patch: Partial<Profile>) => void changeProfile(profile.id, patch);

  return (
    <div className="pb-6">
      <header className="flex items-center gap-1 px-2 pt-2 pb-2">
        <button type="button" onClick={() => navigate(-1)} className="grid size-11 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="flex-1 truncate text-2xl">{t('profile.settingsFor', { name: profile.name })}</h1>
      </header>

      <Card title={t('profile.details')}>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-2">{t('profile.name')}</span>
          <input value={name} onChange={e => setName(e.target.value.slice(0, 40))}
            onBlur={() => { if (name.trim() && name.trim() !== profile.name) set({ name: name.trim() }); else setName(profile.name); }}
            className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-2">{t('profile.birthYear')}</span>
          <input value={birth} inputMode="numeric" aria-invalid={!birthValid}
            onChange={e => setBirth(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={() => { if (birthValid && birthYear !== profile.birthYear) set({ birthYear }); }}
            className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg" />
        </label>
        {!birthValid && <p className="text-sm text-period" role="alert">{t('onboarding.birthInvalid', { max: thisYear })}</p>}
        <ColourPicker value={profile.colour} onChange={colour => set({ colour })} />
      </Card>

      <Card title={t('profile.mode')}>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={t('profile.mode')}>
          {(['track', 'ttc', 'pregnant'] as Mode[]).map(m => (
            <button key={m} type="button" role="radio" aria-checked={profile.mode === m} onClick={() => set({ mode: m })}
              className={`flex min-h-12 flex-col items-start justify-center rounded-xl border-2 px-3 py-2 text-left transition-colors duration-150 ${profile.mode === m ? 'border-primary' : 'border-line'}`}>
              <span className="font-medium">{t(`mode.${m}`)}</span>
              <span className="text-sm text-ink-2">{t(`mode.${m}Hint`)}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('profile.cycle')}>
        <Stepper label={t('profile.cycleLen')} value={s.cycleLen} min={18} max={60} unit={t('common.days')} onChange={v => set({ settings: { ...s, cycleLen: v } })} />
        <Stepper label={t('profile.periodLen')} value={s.periodLen} min={1} max={10} unit={t('common.days')} onChange={v => set({ settings: { ...s, periodLen: v } })} />
        <Stepper label={t('profile.lutealLen')} value={s.lutealLen} min={10} max={16} unit={t('common.days')} onChange={v => set({ settings: { ...s, lutealLen: v } })} />
        <p className="text-sm text-ink-2">{t('profile.cycleHint')}</p>
        <Switch label={t('profile.showFertility')} checked={profile.showFertility} onChange={v => set({ showFertility: v })} hint={t('disclaimer')} />
      </Card>

      <Reminders profile={profile} />
      <PinSection profile={profile} />
      <ExportSection profile={profile} />
      <DeleteSection profile={profile} />
    </div>
  );
}

function Reminders({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const [list, setList] = useState<ReminderRec[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [explain, setExplain] = useState<ReminderRec | null>(null);
  const supported = remindersSupported();

  useEffect(() => {
    const load = () => void listReminders(profile.id).then(setList);
    load();
    void notificationsAllowed().then(setAllowed);
    return onChange((store, id) => { if (store === 'reminders' && id === profile.id) load(); });
  }, [profile.id]);

  async function save(r: ReminderRec) {
    await saveReminder(r);
    await rescheduleAll();
  }
  async function toggle(r: ReminderRec, on: boolean) {
    if (on && !allowed) { setExplain(r); return; }
    await save({ ...r, enabled: on });
  }
  const fertileAvailable = profile.showFertility && profile.mode === 'ttc';

  return (
    <Card title={t('reminders.title')}>
      {!supported && <p className="rounded-xl bg-flag-tint p-3 text-sm">{t('reminders.androidOnly')}</p>}
      <Switch label={t('reminders.discreet')} hint={t('reminders.discreetHint')} checked={profile.discreet}
        onChange={v => void changeProfile(profile.id, { discreet: v })} />
      <ul className="flex flex-col divide-y divide-line">
        {list.map(r => {
          const disabled = !supported || (r.type === 'fertile_soon' && !fertileAvailable);
          return (
            <li key={r.type} className="flex flex-col gap-2 py-3">
              <Switch label={t(`reminders.${r.type}`)} checked={r.enabled && !disabled} disabled={disabled}
                hint={r.type === 'fertile_soon' && !fertileAvailable ? t('reminders.fertileNeeds') : undefined}
                onChange={v => void toggle(r, v)} />
              {r.enabled && !disabled && (
                <div className="flex flex-col gap-2 pl-1">
                  <label className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-ink-2">{t('reminders.time')}</span>
                    <input type="time" value={r.time} onChange={e => e.target.value && void save({ ...r, time: e.target.value })}
                      className="min-h-11 rounded-xl border border-line bg-surface px-3" />
                  </label>
                  {r.type === 'period_soon' && (
                    <Stepper label={t('reminders.daysBefore')} value={r.daysBefore} min={1} max={7} unit={t('common.days')} onChange={v => void save({ ...r, daysBefore: v })} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <BottomSheet open={explain !== null} onClose={() => setExplain(null)} title={t('onboarding.notifyTitle')}
        footer={<div className="flex flex-col gap-2">
          <Button className="w-full" onClick={async () => {
            const ok = await requestNotificationPermission();
            setAllowed(ok);
            if (ok && explain) await save({ ...explain, enabled: true });
            else if (!ok) toast(t('reminders.denied'));
            setExplain(null);
          }}>{t('onboarding.allowReminders')}</Button>
          <Button variant="ghost" className="w-full" onClick={() => setExplain(null)}>{t('common.notNow')}</Button>
        </div>}>
        <p className="text-ink-2">{t('onboarding.notifyBody')}</p>
        <p className="mt-2 text-ink-2">{t('onboarding.notifyDiscreet')}</p>
      </BottomSheet>
    </Card>
  );
}

function PinSection({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const { pinned, setPin, removePin } = useLock();
  const has = Boolean(pinned[profile.id]);
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const close = () => { setOpen(false); setFirst(null); setError(null); };
  return (
    <Card title={t('pin.title')}>
      <p className="text-sm text-ink-2">{t('pin.explain')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)}><KeyRound aria-hidden className="size-4" />{has ? t('pin.change') : t('pin.set')}</Button>
        {has && <Button variant="ghost" onClick={async () => { await removePin(profile.id); void rescheduleAll(); toast(t('pin.removed')); }}>{t('pin.remove')}</Button>}
      </div>
      <BottomSheet open={open} onClose={close} title={first ? t('pin.confirm') : t('pin.choose')}>
        <div className="flex justify-center">
          <PinPad key={first ?? 'a'} error={error} onComplete={async pin => {
            if (!first) { setFirst(pin); setError(null); return; }
            if (pin !== first) { setFirst(null); setError(t('pin.mismatch')); return; }
            await setPin(profile.id, pin);
            void rescheduleAll();
            close();
            toast(t('pin.saved'));
          }} />
        </div>
      </BottomSheet>
    </Card>
  );
}

function ExportSection({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const report = useDoctorReport(profile);
  const [busy, setBusy] = useState(false);
  async function doExport() {
    setBusy(true);
    try {
      // private entries are hers alone: never exported for a profile someone else manages
      const e = await exportProfile(profile.id, !profile.isManaged);
      const base = `ritu-${safeFileName(profile.name)}-${localToday()}`;
      await deliverFiles([
        { name: `${base}-periods.csv`, mime: 'text/csv', text: periodsCsv(e.periods) },
        { name: `${base}-logs.csv`, mime: 'text/csv', text: logsCsv(e.logs) },
        { name: `${base}.json`, mime: 'application/json', text: profileJson(e) },
      ], t('export.title'));
    } catch {
      toast(t('export.failed'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card title={t('export.title')}>
      <p className="text-sm text-ink-2">{profile.isManaged ? t('export.hintManaged') : t('export.hint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => void doExport()}><Download aria-hidden className="size-4" />{t('export.button')}</Button>
        <Button variant="secondary" disabled={report.busy} onClick={() => void report.make()}><FileText aria-hidden className="size-4" />{t('insights.report')}</Button>
      </div>
    </Card>
  );
}

function DeleteSection({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { removePin } = useLock();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const match = typed.trim() === profile.name.trim();
  return (
    <Card title={t('delete.title')}>
      <p className="text-sm text-ink-2">{t('delete.hint')}</p>
      <Button variant="danger" className="self-start" onClick={() => setOpen(true)}><Trash2 aria-hidden className="size-4" />{t('delete.button')}</Button>
      <BottomSheet open={open} onClose={() => { setOpen(false); setTyped(''); }} title={t('delete.confirmTitle', { name: profile.name })}
        footer={<Button variant="danger" className="w-full" disabled={!match} onClick={async () => {
          await deleteProfile(profile.id);
          await removePin(profile.id);
          void rescheduleAll();
          toast(t('delete.done', { name: profile.name }));
          navigate('/', { replace: true });
        }}>{t('delete.button')}</Button>}>
        <p className="mb-3 text-ink-2">{t('delete.confirmBody')}</p>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">{t('delete.typeName', { name: profile.name })}</span>
          <input value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg" />
        </label>
      </BottomSheet>
    </Card>
  );
}
