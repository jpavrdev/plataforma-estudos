import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * ThemeProvider — controla o tema (light/dark).
 * O tema é aplicado em <html data-theme="…">, então qualquer componente
 * que use as CSS variables reage automaticamente. A cor de destaque (--accent)
 * vem fixa de tokens.css (azul #2D6BF5 da especificação).
 */

type Theme = 'light' | 'dark';

interface ThemeContextData {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'ensina:theme';

const ThemeContext = createContext<ThemeContextData | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || defaultTheme,
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Remove qualquer accent inline legado que sobrescreva o token azul.
    document.documentElement.style.removeProperty('--accent');
    localStorage.removeItem('ensina:accent');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
