import { useTranslation } from 'react-i18next';
import { currentLocale, LOCALES, setLocale, type Locale } from '../../i18n';

// Each language goes by its own name, the way people look for it.
const NAMES: Record<Locale, string> = { 'pt-BR': 'Português', en: 'English' };

// Language of the screens and of the emails. The choice is saved in the account by
// the AuthContext, which saves any change made while signed in.
export function LanguageCard() {
  const { t } = useTranslation();
  const active = currentLocale();

  return (
    <div className="card">
      <h3 className="card__title card__title--mb">{t('profile.language.title')}</h3>
      <span className="pf-field__hint">{t('profile.language.hint')}</span>
      <div className="pf-actions" role="radiogroup" aria-label={t('profile.language.title')}>
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={locale === active}
            className={locale === active ? 'btn btn--accent' : 'btn'}
            onClick={() => setLocale(locale)}
          >
            {NAMES[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
