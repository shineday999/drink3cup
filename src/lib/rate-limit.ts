// KV 版登入／改密碼限流（共用）
// 同一個 key（prefix + IP）在 windowMs 內失敗 maxAttempts 次，鎖定 lockoutMs。
// 計數存在 KV，跨 Worker 實例與重新部署都有效。KV 為最終一致，
// 極短時間內的並發請求可能少算幾次，足以擋住暴力破解。
// KV 不可用（未綁定或讀寫失敗）時 fail open：不擋人，只記 warn。

export interface RateLimiterOptions {
  prefix: string;
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface AttemptRecord {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

export interface RateLimiter {
  check(
    kv: KVNamespace | undefined,
    ip: string,
  ): Promise<{ allowed: boolean; retryAfter?: number }>;
  recordFailure(kv: KVNamespace | undefined, ip: string): Promise<void>;
  clear(kv: KVNamespace | undefined, ip: string): Promise<void>;
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const { prefix, maxAttempts, windowMs, lockoutMs } = opts;
  // KV expirationTtl 最小 60 秒
  const ttl = Math.max(60, Math.ceil(Math.max(windowMs, lockoutMs) / 1000));
  const keyOf = (ip: string) => `${prefix}:${ip}`;

  async function read(
    kv: KVNamespace,
    ip: string,
  ): Promise<AttemptRecord | null> {
    try {
      return await kv.get<AttemptRecord>(keyOf(ip), "json");
    } catch (err) {
      console.warn(`[rate-limit ${prefix}] read failed`, err);
      return null;
    }
  }

  return {
    async check(kv, ip) {
      if (!kv) return { allowed: true };
      const rec = await read(kv, ip);
      const now = Date.now();
      if (rec && rec.lockedUntil > now) {
        return {
          allowed: false,
          retryAfter: Math.ceil((rec.lockedUntil - now) / 1000),
        };
      }
      return { allowed: true };
    },

    async recordFailure(kv, ip) {
      if (!kv) return;
      const now = Date.now();
      const prev = await read(kv, ip);
      const rec: AttemptRecord =
        !prev || now - prev.firstAt > windowMs
          ? { count: 1, firstAt: now, lockedUntil: 0 }
          : { ...prev, count: prev.count + 1 };
      if (rec.count >= maxAttempts) rec.lockedUntil = now + lockoutMs;
      try {
        await kv.put(keyOf(ip), JSON.stringify(rec), { expirationTtl: ttl });
      } catch (err) {
        console.warn(`[rate-limit ${prefix}] write failed`, err);
      }
    },

    async clear(kv, ip) {
      if (!kv) return;
      try {
        await kv.delete(keyOf(ip));
      } catch (err) {
        console.warn(`[rate-limit ${prefix}] clear failed`, err);
      }
    },
  };
}
