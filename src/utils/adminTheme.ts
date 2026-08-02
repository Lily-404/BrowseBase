export type ThemePreference = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'adminNothingTheme';

export const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: '系统',
  light: '浅色',
  dark: '深色',
};

export function readThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore
  }
  return 'system';
}

export function writeThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getSystemThemeMediaQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}
