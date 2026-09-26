import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, HeartHandshake, Lock, ShieldCheck, Smartphone, User, WifiOff } from 'lucide-react';
import { addDays, localToday, type ISODate } from '../../../shared/engine';
import { BANGLE_COLOURS, type BangleColour } from '../../data/types';
import { setupProfile } from '../../data/actions';
import { useProfiles } from '../../store/profiles';
import { useLock } from '../../store/lock';
import { useToast } from '../../store/toast';
import { setLang, currentLocale, type Lang } from '../../i18n';
import { isNative } from '../../lib/platform';
import { notificationsAllowed, requestNotificationPermission } from '../../lib/notifications';
import { Button } from '../../components/Button';
import { Stepper } from '../../components/Stepper';
import { Switch } from '../../components/Switch';
import { PinPad } from '../../components/PinPad';

type Step = 'lang' | 'privacy' | 'who' | 'name' | 'birth' | 'last' | 'lengths' | 'fertility' | 'pin' | 'notify' | 'done';

const thisYear = () => new Date().getFullYear();

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const profiles = useProfiles(s => s.profiles);
  const first = profiles.length === 0 && params.get('add') !== '1';
  const [askNotify] = useState(() => isNative() && first);

  const steps = useMemo<Step[]>(() => [
    ...(first ? (['lang', 'privacy'] as Step[]) : []),
    'who', 'name', 'birth', 'last', 'lengths', 'fertility', 'pin',
    ...(askNotify ? (['notify'] as Step[]) : []),
    'done',
  ], [first, askNotify]);

  const usedColours = profiles.map(p => p.colour);
  const freshColour = () => BANGLE_COLOURS.find(c => !usedColours.includes(c)) ?? 'jamuni';

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const [who, setWho] = useState<'me' | 'managed' | null>(null);
  const [name, setName] = useState('');
  const [colour, setColour] = useState<BangleColour>(freshColour);
  const [birth, setBirth] = useState('');
  const [last, setLast] = useState<ISODate | null>(null);
  const [dontRemember, setDontRemember] = useState(false);
  const [cycleLen, setCycleLen] = useState(28);
  const [cycleUnsure, setCycleUnsure] = useState(false);
  const [periodLen, setPeriodLen] = useState(5);
  const [periodUnsure, setPeriodUnsure] = useState(false);
  const [fertility, setFertility] = useState<boolean | null>(null);
  const [pinFirst, setPinFirst] = useState<string | null>(null);
  const [pinMode, setPinMode] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdName, setCreatedName] = useState('');
  const showToast = useToast(s => s.show);

  const today = localToday();
  const birthYear = birth ? Number(birth) : null;
  const birthValid = !birth || (/^\d{4}$/.test(birth) && birthYear! >= 1930 && birthYear! <= thisYear());
  const minor = birthYear !== null && thisYear() - birthYear < 18;
  const fertilityDefault = !(minor || who === 'managed');
  const fertilityOn = fertility ?? fertilityDefault;

  const next = () => setI(n => Math.min(n + 1, steps.length - 1));
  const back = () => {
    if (i === 0) navigate(profiles.length ? '/' : '/onboarding', { replace: true });
    else setI(n => n - 1);
  };

  async function create(pin: string | null) {
    setSaving(true);
    const first = last && !dontRemember ? last : null;
    const pLen = periodUnsure ? 5 : periodLen;
    const end = first ? addDays(first, pLen - 1) : null;
    const profile = await setupProfile({
      name: name.trim(), colour, birthYear, isManaged: who === 'managed', showFertility: fertilityOn,
      settings: { cycleLen: cycleUnsure ? 28 : cycleLen, periodLen: pLen, lutealLen: 14 },
    }, first ? { start: first, end: end! < today ? end : null } : null);
    if (pin) await useLock.getState().setPin(profile.id, pin);
    setCreatedName(profile.name);
    setSaving(false);
    showToast(t('onboarding.created', { name: profile.name }));
    if (askNotify && (await notificationsAllowed())) setI(steps.indexOf('done'));
    else next();
  }

  function restart() {
    setI(0);
    setWho(null); setName(''); setColour(freshColour()); setBirth(''); setLast(null); setDontRemember(false);
    setCycleLen(28); setCycleUnsure(false); setPeriodLen(5); setPeriodUnsure(false); setFertility(null);
    setPinFirst(null); setPinMode(false); setPinError(null);
    navigate('/onboarding?add=1', { replace: true });
  }

  const progress = (i + 1) / steps.length;
  let body: ReactNode = null;
  let action: ReactNode = <Button className="w-full" onClick={next}>{t('common.next')}</Button>;

  switch (step) {
    case 'lang':
      body = (
        <Screen title={t('onboarding.langTitle')} sub="Choose your language · अपनी भाषा चुनें">
          <div className="flex flex-col gap-3">
            {(['en', 'hi'] as Lang[]).map(l => (
              <Choice key={l} selected={currentLocale() === l} onClick={() => void setLang(l)} label={t(`lang.${l}`)} />
            ))}
          </div>
        </Screen>
      );
      break;
    case 'privacy':
      body = (
        <Screen title={t('onboarding.privacyTitle')}>
          <ul className="flex flex-col gap-5">
            <PromiseItem icon={Smartphone} text={t('onboarding.promise1')} />
            <PromiseItem icon={ShieldCheck} text={t('onboarding.promise2')} />
            <PromiseItem icon={WifiOff} text={t('onboarding.promise3')} />
          </ul>
        </Screen>
      );
      break;
    case 'who':
      body = (
        <Screen title={t('onboarding.whoTitle')}>
          <div className="flex flex-col gap-3">
            <Choice selected={who === 'me'} onClick={() => setWho('me')} label={t('onboarding.whoMe')} icon={User} />
            <Choice selected={who === 'managed'} onClick={() => setWho('managed')} label={t('onboarding.whoOther')}
              hint={t('onboarding.whoOtherHint')} icon={HeartHandshake} />
          </div>
        </Screen>
      );
      action = <Button className="w-full" disabled={!who} onClick={next}>{t('common.next')}</Button>;
      break;
    case 'name':
      body = (
        <Screen title={who === 'managed' ? t('onboarding.nameTitleOther') : t('onboarding.nameTitle')}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-2">{t('profile.name')}</span>
            <input
              value={name} onChange={e => setName(e.target.value.slice(0, 40))} autoComplete="off" autoFocus
              className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg"
            />
          </label>
          <ColourPicker value={colour} onChange={setColour} />
        </Screen>
      );
      action = <Button className="w-full" disabled={!name.trim()} onClick={next}>{t('common.next')}</Button>;
      break;
    case 'birth':
      body = (
        <Screen title={t('onboarding.birthTitle')} sub={t('onboarding.birthSub')}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-2">{t('profile.birthYear')}</span>
            <input
              value={birth} onChange={e => setBirth(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric" placeholder={String(thisYear() - 25)} aria-invalid={!birthValid}
              className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg"
            />
          </label>
          {!birthValid && <p className="text-sm text-period" role="alert">{t('onboarding.birthInvalid', { max: thisYear() })}</p>}
        </Screen>
      );
      action = (
        <div className="flex flex-col gap-2">
          <Button className="w-full" disabled={!birthValid} onClick={next}>{t('common.next')}</Button>
          {!birth && <Button variant="ghost" className="w-full" onClick={next}>{t('common.skip')}</Button>}
        </div>
      );
      break;
    case 'last':
      body = (
        <Screen title={t('onboarding.lastTitle')}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-2">{t('onboarding.lastLabel')}</span>
            <input
              type="date" max={today} value={last ?? ''} disabled={dontRemember}
              onChange={e => setLast(e.target.value && e.target.value <= today ? e.target.value : null)}
              className="min-h-12 rounded-xl border border-line bg-surface px-3 text-lg disabled:opacity-50"
            />
          </label>
          <Switch label={t('onboarding.dontRemember')} hint={t('onboarding.dontRememberHint')} checked={dontRemember} onChange={setDontRemember} />
        </Screen>
      );
      action = <Button className="w-full" disabled={!last && !dontRemember} onClick={next}>{t('common.next')}</Button>;
      break;
    case 'lengths':
      body = (
        <Screen title={t('onboarding.lengthsTitle')} sub={t('onboarding.lengthsSub')}>
          <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
            <Stepper label={t('profile.cycleLen')} value={cycleUnsure ? 28 : cycleLen} min={18} max={60} onChange={v => { setCycleLen(v); setCycleUnsure(false); }} unit={t('common.days')} />
            <Switch label={t('onboarding.notSure')} checked={cycleUnsure} onChange={setCycleUnsure} />
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
            <Stepper label={t('profile.periodLen')} value={periodUnsure ? 5 : periodLen} min={1} max={10} onChange={v => { setPeriodLen(v); setPeriodUnsure(false); }} unit={t('common.days')} />
            <Switch label={t('onboarding.notSure')} checked={periodUnsure} onChange={setPeriodUnsure} />
          </div>
        </Screen>
      );
      break;
    case 'fertility':
      body = (
        <Screen title={t('onboarding.fertilityTitle')}>
          <div className="rounded-2xl bg-surface p-4">
            <Switch label={t('profile.showFertility')} checked={fertilityOn} onChange={setFertility}
              hint={minor || who === 'managed' ? t('onboarding.fertilityMinor') : undefined} />
          </div>
          <p className="text-sm text-ink-2">{t('disclaimer')}</p>
        </Screen>
      );
      break;
    case 'pin':
      body = pinMode ? (
        <Screen title={pinFirst ? t('pin.confirm') : t('pin.choose')}>
          <div className="flex justify-center">
            <PinPad
              key={pinFirst ?? 'first'} error={pinError}
              onComplete={pin => {
                if (!pinFirst) { setPinFirst(pin); setPinError(null); return; }
                if (pin !== pinFirst) { setPinFirst(null); setPinError(t('pin.mismatch')); return; }
                void create(pin);
              }}
            />
          </div>
        </Screen>
      ) : (
        <Screen title={t('onboarding.pinTitle')} sub={t('onboarding.pinSub')}>
          <Lock aria-hidden className="mx-auto size-12 text-ink-2" strokeWidth={1.5} />
        </Screen>
      );
      action = pinMode ? (
        <Button variant="ghost" className="w-full" onClick={() => { setPinMode(false); setPinFirst(null); setPinError(null); }}>{t('common.back')}</Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button className="w-full" disabled={saving} onClick={() => setPinMode(true)}>{t('onboarding.addPin')}</Button>
          <Button variant="ghost" className="w-full" disabled={saving} onClick={() => void create(null)}>{t('onboarding.noPin')}</Button>
        </div>
      );
      break;
    case 'notify':
      body = (
        <Screen title={t('onboarding.notifyTitle')}>
          <p className="text-ink-2">{t('onboarding.notifyBody')}</p>
          <p className="text-ink-2">{t('onboarding.notifyDiscreet')}</p>
        </Screen>
      );
      action = (
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => void requestNotificationPermission().finally(next)}>{t('onboarding.allowReminders')}</Button>
          <Button variant="ghost" className="w-full" onClick={next}>{t('common.notNow')}</Button>
        </div>
      );
      break;
    case 'done':
      body = <Screen title={t('onboarding.doneTitle', { name: createdName })} sub={t('onboarding.doneSub')} />;
      action = (
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => navigate('/', { replace: true })}>{t('common.done')}</Button>
          <Button variant="secondary" className="w-full" onClick={restart}>{t('onboarding.addAnother')}</Button>
        </div>
      );
      break;
  }

  const canGoBack = step !== 'done' && !(step === 'notify') && !(i === 0 && first);
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-2 px-2 pt-2">
        {canGoBack ? (
          <button type="button" onClick={back} className="grid size-11 place-items-center rounded-full" aria-label={t('common.back')}>
            <ArrowLeft aria-hidden className="size-5" />
          </button>
        ) : <span className="size-11" />}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-label={t('onboarding.progress')}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="size-11" />
      </div>
      <main className="flex flex-1 flex-col px-4 pt-6">{body}</main>
      <div className="px-4 pt-4 pb-4">{action}</div>
    </div>
  );
}

function Screen({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[1.75rem]">{title}</h1>
        {sub && <p className="text-ink-2">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function Choice({ selected, onClick, label, hint, icon: Icon }: {
  selected: boolean; onClick: () => void; label: string; hint?: string; icon?: typeof User;
}) {
  return (
    <button
      type="button" aria-pressed={selected} onClick={onClick}
      className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 text-left transition-colors duration-150 ${selected ? 'border-primary' : 'border-transparent'}`}
    >
      {Icon && <Icon aria-hidden className="size-6 shrink-0 text-primary" />}
      <span className="flex flex-col">
        <span className="text-lg font-medium">{label}</span>
        {hint && <span className="text-sm text-ink-2">{hint}</span>}
      </span>
    </button>
  );
}

function PromiseItem({ icon: Icon, text }: { icon: typeof User; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
      <span className="text-lg">{text}</span>
    </li>
  );
}

export function ColourPicker({ value, onChange }: { value: BangleColour; onChange: (c: BangleColour) => void }) {
  const { t } = useTranslation();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-2">{t('profile.colour')}</legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
        {BANGLE_COLOURS.map(c => (
          <button
            key={c} type="button" aria-pressed={value === c} onClick={() => onChange(c)}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-surface py-2 text-sm transition-colors duration-150 ${value === c ? 'border-ink' : 'border-transparent'}`}
          >
            <span aria-hidden className="size-7 rounded-full border-[5px]" style={{ borderColor: `var(--bangle-${c})` }} />
            {t(`colours.${c}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
