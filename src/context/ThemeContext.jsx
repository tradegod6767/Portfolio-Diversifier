import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Get the initial theme based on:
 * 1. localStorage preference
 * 2. System preference (prefers-color-scheme)
 * 3. Default to 'light'
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  // Check localStorage first
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply theme class to document element
 */
function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
