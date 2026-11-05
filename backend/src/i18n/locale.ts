export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

// Only the frontend that already speaks both languages sends X-Locale. Without it
// the answer stays in Portuguese, as before: tabs still running the old frontend,
// the external monitor and any other client. Accept-Language is not used because
// every browser sends it, which would switch the old frontend's messages to English.
export function localeFromHeader(value: string | undefined): Locale {
    return value?.trim().toLowerCase().startsWith("en") ? "en" : DEFAULT_LOCALE;
}
