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
  if (theme === 'system') {
    // only clear a theme we set ourselves; a host page may have stamped its own
    if (root.dataset.themeOwner === 'ritu') {
      root.removeAttribute('data-theme');
      delete root.dataset.themeOwner;
    }
    return;
  }
  root.setAttribute('data-theme', theme);
  root.dataset.themeOwner = 'ritu';
}

export function setTheme(theme: Theme): void {
  try { localStorage.setItem(KEY, theme); } catch { /* per-device preference only */ }
  applyTheme(theme);
}
