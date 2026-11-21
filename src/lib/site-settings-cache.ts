// site_settings 的短暫快取（每個 Worker isolate 各自一份）。
// middleware 每個請求都會讀 site_settings；沒有快取時每次請求都多一趟 D1 往返，直接墊高 TTFB。
// 跟 rates.ts 同樣做法：TTL 內不再查 D1，後台改設定時主動讓快取失效。
const TTL_MS = 30_000;

let cached: { value: unknown; expiresAt: number } | null = null;

export async function cachedSiteSettings<T>(
  load: () => Promise<T>,
): Promise<T> {
  if (cached && Date.now() < cached.expiresAt) return cached.value as T;
  const value = await load();
  if (value !== undefined) {
    cached = { value, expiresAt: Date.now() + TTL_MS };
  }
  return value;
}

export function invalidateSiteSettings(): void {
  cached = null;
}
