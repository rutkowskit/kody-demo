export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export type AppTheme = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  border: string;
  inputText: string;
  placeholder: string;
  segmentBg: string;
  segmentActiveBg: string;
  segmentText: string;
  segmentActiveText: string;
  codeLabel: string;
};

export const THEMES: Record<ResolvedTheme, AppTheme> = {
  light: {
    background: '#f3f4f6',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#6b7280',
    textSecondary: '#4b5563',
    border: '#d1d5db',
    inputText: '#111827',
    placeholder: '#9ca3af',
    segmentBg: '#e5e7eb',
    segmentActiveBg: '#ffffff',
    segmentText: '#4b5563',
    segmentActiveText: '#111827',
    codeLabel: '#1a1a1a',
  },
  dark: {
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    textSecondary: '#d1d5db',
    border: '#374151',
    inputText: '#f9fafb',
    placeholder: '#6b7280',
    segmentBg: '#374151',
    segmentActiveBg: '#4b5563',
    segmentText: '#9ca3af',
    segmentActiveText: '#f9fafb',
    codeLabel: '#e5e7eb',
  },
};

export const THEME_STORAGE_KEY = '@kody-demo/theme-preference';

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
];