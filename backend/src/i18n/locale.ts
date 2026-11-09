export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

// Reads a language sent by a client or kept in a cookie. Anything that is not
// English is Portuguese, the language of origin.
export function parseLocale(value: string | null | undefined): Locale {
    return value?.trim().toLowerCase().startsWith("en") ? "en" : DEFAULT_LOCALE;
}
