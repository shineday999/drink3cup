import type { getDB } from "./db";
import zhHant from "../i18n/messages/zh-Hant.json";

// 首頁「手作路線」分類卡片（site_categories）：標題 / 簡介 各語言一份，圖片仍放 site_images（key = cat_<code>）。
// 表由程式自動建立，不需手動 migration。
export const CATEGORY_LOCALES = ["zh-Hant", "en", "ms-MY", "id-ID"] as const;

export const CODE_RE = /^[a-z0-9][a-z0-9-]{0,29}$/;

type DB = ReturnType<typeof getDB>;

export interface SiteCategory {
  code: string;
  sort_order: number;
  titles: Record<string, string>;
  descs: Record<string, string>;
}

// 讀：D1 裡的 JSON 字串 → 物件（壞資料回空物件）
export function parseTextMap(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string" && val.trim()) out[k] = val.trim();
    }
    return out;
  } catch {
    return {};
  }
}

// 寫：只留支援的語言、去空白、限制長度
export function cleanTextMap(
  input: unknown,
  maxLen: number,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== "object") return out;
  for (const loc of CATEGORY_LOCALES) {
    const v = (input as Record<string, unknown>)[loc];
    if (typeof v === "string" && v.trim()) out[loc] = v.trim().slice(0, maxLen);
  }
  return out;
}

// 咖啡豆 / 沖煮器具卡片的預設說明文字(來自語言檔);後臺簡介還是空的時候,一次性填進去讓後臺可以維護。
const LEGACY_DESCS: Record<string, Record<string, string>> = {
  beans: {
    "zh-Hant": zhHant.home.cat_beans_desc,
  },
  brewing: {
    "zh-Hant": zhHant.home.cat_brewing_desc,
  },
};

async function backfillLegacyDescs(db: DB): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  for (const [code, descs] of Object.entries(LEGACY_DESCS)) {
    await db
      .prepare(
        "UPDATE site_categories SET descs = ?, updated_at = ? WHERE code = ? AND (descs IS NULL OR descs = '' OR descs = '{}')",
      )
      .bind(JSON.stringify(descs), now, code)
      .run();
  }
}

export async function ensureCategoryTable(db: DB): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_categories (
         code       TEXT PRIMARY KEY,
         sort_order INTEGER NOT NULL DEFAULT 0,
         titles     TEXT NOT NULL DEFAULT '{}',
         descs      TEXT NOT NULL DEFAULT '{}',
         updated_at INTEGER NOT NULL DEFAULT 0
       )`,
    )
    .run();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM site_categories")
    .first<{ n: number }>();
  if (!row || row.n === 0) {
    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare(
        `INSERT OR IGNORE INTO site_categories (code, sort_order, titles, descs, updated_at)
         VALUES ('beans', 1, '{}', '{}', ?), ('brewing', 2, '{}', '{}', ?)`,
      )
      .bind(now, now)
      .run();
  }
  await backfillLegacyDescs(db);
}

export async function listCategories(db: DB): Promise<SiteCategory[]> {
  const res = await db
    .prepare(
      "SELECT code, sort_order, titles, descs FROM site_categories ORDER BY sort_order ASC, code ASC",
    )
    .all<{ code: string; sort_order: number; titles: string; descs: string }>();
  return (res.results ?? []).map((r) => ({
    code: r.code,
    sort_order: Number(r.sort_order) || 0,
    titles: parseTextMap(r.titles),
    descs: parseTextMap(r.descs),
  }));
}
