import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../components/ScreenHeader';
import { currentLocale, setLang, type Lang } from '../../i18n';
import { setTheme, storedTheme, type Theme } from '../../lib/theme';

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink-2">{label}</legend>
      <div className="flex gap-2">
        {options.map(o => (
          <label
            key={o.value}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-line px-3 text-ink transition-colors duration-150 has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-primary"
          >
            <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="mx-4 mb-4 rounded-2xl bg-surface p-4">{children}</section>;
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const [theme, setThemeState] = useState<Theme>(storedTheme);
  const lang = currentLocale();

  return (
    <>
      <ScreenHeader title={t('tabs.settings')} />
      <Section>
        <Segmented<Lang>
          label={t('settings.language')}
          value={lang}
          options={[{ value: 'en', label: t('lang.en') }, { value: 'hi', label: t('lang.hi') }]}
          onChange={v => void setLang(v)}
        />
      </Section>
      <Section>
        <Segmented<Theme>
          label={t('settings.theme')}
          value={theme}
          options={[
            { value: 'system', label: t('settings.themeSystem') },
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
          ]}
          onChange={v => { setTheme(v); setThemeState(v); }}
        />
      </Section>
      <Section>
        <h2 className="mb-2 text-xl text-ink">{t('settings.about')}</h2>
        <p className="text-ink-2">{t('privacy')}</p>
        <p className="mt-2 text-ink-2">{t('disclaimer')}</p>
        <p className="mt-2 text-sm text-ink-2">{t('settings.version', { version: __APP_VERSION__ })}</p>
      </Section>
    </>
  );
}
