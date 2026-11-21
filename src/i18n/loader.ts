import type { Locale } from "./config";

type Messages = Record<string, unknown>;

const messagesImporters: Record<Locale, () => Promise<{ default: Messages }>> =
  {
    "zh-Hant": () => import("./messages/zh-Hant.json"),
  };

const cache = new Map<Locale, Messages>();

// F-06: prototype pollution defense — 過濾 __proto__/constructor/prototype keys,
// 即使 attacker 控制 messages JSON 也無法汙染 Object.prototype
const FORBIDDEN_KEY_PARTS = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeMessages(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeMessages);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEY_PARTS.has(key)) continue;
    out[key] = sanitizeMessages((value as Record<string, unknown>)[key]);
  }
  return out;
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const mod = await messagesImporters[locale]();
  const raw = mod.default ?? (mod as unknown as Messages);
  const messages = sanitizeMessages(raw) as Messages;
  cache.set(locale, messages);
  return messages;
}
