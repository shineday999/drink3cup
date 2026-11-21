type Messages = Record<string, unknown>;
export type Translator = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function createT(messages: Messages): Translator {
  return function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    const parts = key.split(".");
    let cur: unknown = messages;
    for (const part of parts) {
      if (
        cur &&
        typeof cur === "object" &&
        part in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        if (typeof console !== "undefined") {
          console.warn(`[i18n] missing key: ${key}`);
        }
        return key;
      }
    }

    if (typeof cur !== "string") return key;

    if (!params) return cur;

    return (cur as string).replace(/\{(\w+)\}/g, (match, name) => {
      if (name in (params as Record<string, string | number>)) {
        return String((params as Record<string, string | number>)[name]);
      }
      return match;
    });
  };
}

/**
 * Translate a D1 enum value (status / category / payment_status etc).
 * Returns the value unchanged if no translation key exists (safe fallback
 * to the raw D1 value rather than showing the dot-notation key).
 *
 * Example: tEnum(t, 'status', 'pending') -> t('admin.value.status.pending')
 *          if defined -> '待确认'; else fallback -> 'pending'.
 */
export function tEnum(t: Translator, kind: string, value: string): string {
  if (!value) return value;
  const key = `admin.value.${kind}.${value}`;
  const result = t(key);
  return result !== key ? result : value;
}
