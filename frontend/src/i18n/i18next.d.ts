import 'i18next';
import type { ptBR } from './locales/pt-BR';

// Typed keys: t('landing.hero.title') autocompletes, and a key that does not
// exist in the Portuguese catalog fails the build.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof ptBR };
  }
}
