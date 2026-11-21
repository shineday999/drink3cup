// 匯率表（D1 exchange_rates）讀寫與快取。
// 基準幣別是人民幣：per_cny = 1 人民幣可換多少該幣別。
import { setRates, type RateTable } from "./format";

const TTL_MS = 60_000; // 改匯率後，各處最多 1 分鐘內生效
const RETRY_MS = 10_000; // 讀取失敗（例如遷移還沒套用）時，稍後再試

let nextLoadAt = 0;

export interface RateRow {
  currency: string;
  per_cny: number;
  updated_at: number;
}

export async function loadRates(db: D1Database): Promise<RateRow[]> {
  const { results } = await db
    .prepare(
      "SELECT currency, per_cny, updated_at FROM exchange_rates ORDER BY currency",
    )
    .all<RateRow>();
  return results ?? [];
}

/** 每個請求呼叫一次（middleware）；有快取時幾乎不花時間。 */
export async function ensureRates(db: D1Database | undefined): Promise<void> {
  if (!db || Date.now() < nextLoadAt) return;
  try {
    const table: RateTable = {};
    for (const r of await loadRates(db)) table[r.currency] = r.per_cny;
    setRates(table);
    nextLoadAt = Date.now() + TTL_MS;
  } catch {
    // 表不存在或暫時讀不到：沿用目前的值（預設值），稍後再試
    nextLoadAt = Date.now() + RETRY_MS;
  }
}

export function invalidateRates(): void {
  nextLoadAt = 0;
}

/** 一次寫入多個幣別的匯率（updates: 幣別 → per_cny）。CNY 不可修改。 */
export async function saveRates(
  db: D1Database,
  updates: Record<string, number>,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const stmts = Object.entries(updates)
    .filter(([currency]) => currency !== "CNY")
    .map(([currency, perCny]) =>
      db
        .prepare(
          `INSERT INTO exchange_rates (currency, per_cny, updated_at) VALUES (?, ?, ?)
           ON CONFLICT (currency) DO UPDATE SET per_cny = excluded.per_cny, updated_at = excluded.updated_at`,
        )
        .bind(currency, perCny, now),
    );
  if (stmts.length > 0) await db.batch(stmts);
  invalidateRates();
}
