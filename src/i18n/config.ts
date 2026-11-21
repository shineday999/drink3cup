export const locales = ["zh-Hans", "en", "ms-MY", "id-ID"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-Hans";

export const localeHreflang: Record<Locale, string> = {
  "zh-Hans": "zh-Hans",
  en: "en",
  "ms-MY": "ms-MY",
  "id-ID": "id-ID",
};

export const localeNames: Record<Locale, string> = {
  "zh-Hans": "简体中文",
  en: "English",
  "ms-MY": "Bahasa Melayu",
  "id-ID": "Bahasa Indonesia",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

export function localeFromPath(pathname: string): Locale | null {
  for (const l of locales) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      return l;
    }
  }
  return null;
}

export function localizedPath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalized === "/" ? "/" : normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
