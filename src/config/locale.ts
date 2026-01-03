export const supportedLocales = ["en", "he"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && supportedLocales.includes(value as Locale);

export const parseLocale = (value: unknown, fallback: Locale = defaultLocale): Locale =>
  isLocale(value) ? value : fallback;
