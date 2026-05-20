import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'nav_app_theme';
const THEMES = { DARK: 'dark', LIGHT: 'light' };

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === THEMES.LIGHT || saved === THEMES.DARK) {
        return saved;
      }
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return THEMES.LIGHT;
      }
    } catch {
      // Silent fail, default to dark theme
    }
    return THEMES.DARK;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = e => {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        setTheme(e.matches ? THEMES.LIGHT : THEMES.DARK);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  const setLightTheme = useCallback(() => setTheme(THEMES.LIGHT), []);
  const setDarkTheme = useCallback(() => setTheme(THEMES.DARK), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: THEMES.DARK,
      toggleTheme: () => {},
      setLightTheme: () => {},
      setDarkTheme: () => {},
    };
  }
  return context;
}

export { THEMES };
