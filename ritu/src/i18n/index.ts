import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';

export type Lang = 'en' | 'hi';
const KEY = 'ritu.lang';

function storedLang(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: storedLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

document.documentElement.lang = i18n.language;

export const currentLocale = (): Lang => (i18n.language === 'hi' ? 'hi' : 'en');

export async function setLang(lang: Lang): Promise<void> {
  try { localStorage.setItem(KEY, lang); } catch { /* storage blocked: language still changes for this session */ }
  document.documentElement.lang = lang;
  await i18n.changeLanguage(lang);
}

/** Intl locale for dates and numbers. */
export const intlLocale = (): string => (currentLocale() === 'hi' ? 'hi-IN' : 'en-IN');

export default i18n;
