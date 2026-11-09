import { useTranslation } from 'react-i18next';
import { currentLocale, setLocale } from '../i18n';

interface LanguageToggleProps {
  inline?: boolean;
}

// Switches between Portuguese and English. The button shows the language it
// switches to, the way the theme button shows the theme it turns on.
export function LanguageToggle({ inline = false }: LanguageToggleProps) {
  const { t } = useTranslation();
  const next = currentLocale() === 'en' ? 'pt-BR' : 'en';

  return (
    <button
      type="button"
      className={`theme-toggle language-toggle${inline ? ' theme-toggle--inline' : ''}`}
      onClick={() => setLocale(next)}
      aria-label={t('languageToggle.label')}
      lang={next}
    >
      {next === 'en' ? 'EN' : 'PT'}
    </button>
  );
}
