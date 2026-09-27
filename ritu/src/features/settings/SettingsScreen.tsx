import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, DatabaseBackup, Trash2, Upload } from 'lucide-react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { LearnLink } from '../../components/LearnLink';
import { ConfirmSheet } from '../../components/ConfirmSheet';
import { currentLocale, setLang, type Lang } from '../../i18n';
import { setTheme, storedTheme, type Theme } from '../../lib/theme';
import { buildBackup, parseBackup, restoreBackup, type Backup } from '../../lib/backup';
import { deliverFiles, pickTextFile } from '../../lib/files';
import { rescheduleAll } from '../../lib/notifications';
import { recompute } from '../../data/actions';
import { deleteProfile } from '../../data/profiles';
import { backupState, forgetBackupState, markBackedUp } from '../../lib/backupReminder';
import { formatDateTime } from '../../lib/format';
import { BottomSheet } from '../../components/BottomSheet';
import { localToday } from '../../../shared/engine';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { usePrefs, type WeekStart } from '../../store/prefs';
import { toast } from '../../store/toast';

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <label
            key={o.value}
            className="flex min-h-11 flex-1 basis-auto cursor-pointer items-center justify-center rounded-full border border-line px-3 text-center text-ink transition-colors duration-150 has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-primary"
          >
            <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl bg-surface p-4">
      {title && <h2 className="text-xl text-ink">{title}</h2>}
      {children}
    </section>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const [theme, setThemeState] = useState<Theme>(storedTheme);
  const { weekStart, setWeekStart } = usePrefs();
  const profiles = useProfiles(s => s.profiles);
  const { pinned, unlocked } = useLock();
  const [pending, setPending] = useState<Backup | null>(null);
  const lang = currentLocale();
  const [lastBackup, setLastBackup] = useState<number | null>(null);
  useEffect(() => { void backupState().then(s => setLastBackup(s.last)).catch(() => undefined); }, []);

  async function saveBackup() {
    const open = profiles.filter(p => !(pinned[p.id] && !unlocked[p.id]));
    if (!open.length) { toast(t('backup.nothing')); return; }
    const b = await buildBackup(open.map(p => p.id), p => !p.isManaged);
    await deliverFiles([{ name: `ritu-backup-${localToday()}.json`, mime: 'application/json', text: JSON.stringify(b) }], t('backup.save'));
    const now = Date.now();
    await markBackedUp(now);
    setLastBackup(now);
    if (open.length < profiles.length) toast(t('backup.skippedLocked', { count: profiles.length - open.length }));
  }

  async function chooseRestore() {
    const text = await pickTextFile('application/json,.json');
    if (text === null) return;
    try { setPending(parseBackup(text)); } catch { toast(t('backup.invalid')); }
  }

  async function doRestore() {
    if (!pending) return;
    const ids = await restoreBackup(pending);
    for (const id of ids) await recompute(id);
    await useProfiles.getState().reload();
    await useLock.getState().load(useProfiles.getState().profiles.map(p => p.id));
    void rescheduleAll();
    setPending(null);
    toast(t('backup.restored', { count: ids.length }));
  }

  return (
    <>
      <ScreenHeader title={t('tabs.settings')} />
      <Section>
        <Segmented<Lang> label={t('settings.language')} value={lang}
          options={[{ value: 'en', label: t('lang.en') }, { value: 'hi', label: t('lang.hi') }]}
          onChange={v => { void setLang(v).then(() => rescheduleAll()); }} />
        <Segmented<Theme> label={t('settings.theme')} value={theme}
          options={[{ value: 'system', label: t('settings.themeSystem') }, { value: 'light', label: t('settings.themeLight') }, { value: 'dark', label: t('settings.themeDark') }]}
          onChange={v => { setTheme(v); setThemeState(v); }} />
        <Segmented<WeekStart> label={t('settings.weekStart')} value={weekStart}
          options={[{ value: 'sun', label: t('settings.sunday') }, { value: 'mon', label: t('settings.monday') }]}
          onChange={setWeekStart} />
      </Section>

      <Section title={t('settings.profiles')}>
        <p className="text-sm text-ink-2">{t('settings.profilesHint')}</p>
        <Link to="/profiles" className="inline-flex min-h-11 items-center gap-1 font-medium text-primary">{t('settings.manageProfiles')}<ChevronRight aria-hidden className="size-4" /></Link>
      </Section>

      <Section title={t('backup.title')}>
        <p className="text-sm text-ink-2">{t('backup.hint')}</p>
        <p className="text-sm font-medium">{lastBackup ? t('backup.last', { when: formatDateTime(lastBackup) }) : t('backup.never')}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void saveBackup()}><DatabaseBackup aria-hidden className="size-4" />{t('backup.save')}</Button>
          <Button variant="secondary" onClick={() => void chooseRestore()}><Upload aria-hidden className="size-4" />{t('backup.restore')}</Button>
        </div>
      </Section>

      <LearnLink className="mx-4 mb-4" />

      <EraseAll />

      <Section title={t('settings.about')}>
        <p className="text-ink-2">{t('privacy')}</p>
        <p className="text-ink-2">{t('disclaimer')}</p>
        <Link to="/privacy" className="inline-flex min-h-11 items-center gap-1 font-medium text-primary">{t('settings.privacyPolicy')}<ChevronRight aria-hidden className="size-4" /></Link>
        <p className="text-sm text-ink-2">{t('settings.version', { version: __APP_VERSION__ })}</p>
      </Section>

      <ConfirmSheet
        open={pending !== null} onClose={() => setPending(null)} title={t('backup.confirmTitle')}
        body={pending ? t('backup.confirmBody', { count: pending.profiles.length, names: pending.profiles.map(p => p.profile.name).join(', ') }) : ''}
        actions={[{ label: t('backup.restore'), onClick: () => void doRestore(), variant: 'primary' }, { label: t('common.cancel'), onClick: () => setPending(null) }]}
      />
    </>
  );
}

/** Remove every profile, PIN and setting from this phone, as if Ritu were just installed. */
function EraseAll() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profiles = useProfiles(s => s.profiles);
  const [open, setOpen] = useState(false);
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const close = () => { setOpen(false); setSure(false); };

  async function erase() {
    setBusy(true);
    try {
      const { removePin } = useLock.getState();
      for (const p of profiles) {
        await deleteProfile(p.id);
        await removePin(p.id);
      }
      await forgetBackupState();
      await useProfiles.getState().reload();
      void rescheduleAll();
      close();
      toast(t('erase.done'));
      navigate('/onboarding', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title={t('erase.title')}>
      <p className="text-sm text-ink-2">{t('erase.hint')}</p>
      <Button variant="danger" className="self-start" disabled={!profiles.length} onClick={() => setOpen(true)}>
        <Trash2 aria-hidden className="size-4" />{t('erase.button')}
      </Button>
      <BottomSheet open={open} onClose={close} title={t('erase.confirmTitle')}
        footer={<Button variant="danger" className="w-full" disabled={!sure || busy} onClick={() => void erase()}>{t('erase.button')}</Button>}>
        <p className="mb-3 text-ink-2">{t('erase.confirmBody', { count: profiles.length })}</p>
        <label className="flex min-h-11 items-start gap-3">
          <input type="checkbox" checked={sure} onChange={e => setSure(e.target.checked)} className="mt-1 size-5 accent-[var(--period)]" />
          <span>{t('erase.check')}</span>
        </label>
      </BottomSheet>
    </Section>
  );
}
