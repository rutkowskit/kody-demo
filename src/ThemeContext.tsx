import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import {
  THEME_STORAGE_KEY,
  THEMES,
  type AppTheme,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  colors: AppTheme;
  setPreference: (preference: ThemePreference) => void;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName | null | undefined,
): ResolvedTheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

function preferenceToColorScheme(preference: ThemePreference): ColorSchemeName {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return 'unspecified';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null | undefined>(
    Appearance.getColorScheme(),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        const next =
          stored === 'light' || stored === 'dark' || stored === 'system'
            ? stored
            : 'system';
        setPreferenceState(next);
        Appearance.setColorScheme(preferenceToColorScheme(next));
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    Appearance.setColorScheme(preferenceToColorScheme(next));
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const resolved = resolveTheme(preference, systemScheme);
  const colors = THEMES[resolved];

  const value = useMemo(
    () => ({ preference, resolved, colors, setPreference, isReady }),
    [preference, resolved, colors, setPreference, isReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}