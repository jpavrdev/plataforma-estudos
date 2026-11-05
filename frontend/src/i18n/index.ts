import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptBR } from './locales/pt-BR';
import { en } from './locales/en';

export const LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

// The choice lives in a cookie, not in localStorage: signing out and an expired
// session clear the whole localStorage, and the language has to survive both.
const COOKIE = 'locale';
const ONE_YEAR_S = 60 * 60 * 24 * 365;

function savedLocale(): Locale | null {
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return LOCALES.find((l) => l === value) ?? null;
}

// A new visitor gets the browser language: Portuguese if it is any Portuguese,
// English otherwise.
function browserLocale(): Locale {
  const first = navigator.languages?.[0] ?? navigator.language ?? 'pt-BR';
  return first.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { 'pt-BR': { translation: ptBR }, en: { translation: en } },
  lng: savedLocale() ?? browserLocale(),
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export function currentLocale(): Locale {
  return i18n.language === 'en' ? 'en' : 'pt-BR';
}

export function setLocale(locale: Locale) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_S}; SameSite=Lax${secure}`;
  document.documentElement.lang = locale;
  void i18n.changeLanguage(locale);
}

export default i18n;
