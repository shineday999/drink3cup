// 目前只做繁體中文。未來要加語言:在此加入代碼、補 loader 與 messages/<code>.json。
export const locales = ["zh-Hant"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-Hant";

export const localeHreflang: Record<Locale, string> = {
  "zh-Hant": "zh-Hant",
};

export const localeNames: Record<Locale, string> = {
  "zh-Hant": "繁體中文",
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
