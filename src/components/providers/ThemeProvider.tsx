/**
 * @fileoverview Custom ThemeProvider — class-based dark mode.
 *
 * Strategy:
 *  - Reads initial theme from localStorage (key: rwp-web-theme).
 *  - Falls back to OS prefers-color-scheme.
 *  - Applies/removes 'dark' class on <html> element.
 *  - Persists preference to localStorage on every change.
 *
 * Replaces next-themes. Identical implementation to admin panel ThemeProvider.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/Constants';

type Theme = 'light' | 'dark';

export interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<UseThemeReturn | undefined>(undefined);

/** Read the initial theme from storage → OS preference → fallback to 'dark'. */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply the theme by toggling the 'dark' class on <html>. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme class whenever theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const value: UseThemeReturn = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Hook to consume theme context. Must be inside <ThemeProvider>. */
export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
