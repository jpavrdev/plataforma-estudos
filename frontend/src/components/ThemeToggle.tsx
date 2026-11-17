import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  inline?: boolean;
}

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle${inline ? ' theme-toggle--inline' : ''}`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('themeToggle.toLight') : t('themeToggle.toDark')}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
