export type Theme = 'system' | 'light' | 'dark';
const KEY = 'ritu.theme';

export function storedTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
  try { localStorage.setItem(KEY, theme); } catch { /* per-device preference only */ }
  applyTheme(theme);
}
