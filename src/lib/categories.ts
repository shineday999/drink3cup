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

// 飾品 / 香品卡片原本寫在語言檔裡的說明文字；後臺簡介還是空的時候，一次性填進去讓後臺可以維護。
const LEGACY_DESCS: Record<string, Record<string, string>> = {
  beans: {
    "zh-Hant": zhHant.home.cat_amber_desc,
  },
  brewing: {
    "zh-Hant": zhHant.home.cat_incense_desc,
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
  await db
    .prepare(
      `UPDATE site_categories SET descs = ?, updated_at = ?
       WHERE (code = 'tea' OR json_extract(titles, '$."zh-Hant"') IN ('茶葉', '茶葉'))
         AND (descs IS NULL OR descs = '' OR descs = '{}')`,
    )
    .bind(JSON.stringify(TEA_DESCS), now)
    .run();
}

// 茶葉分類（後臺新增的）：程式碼是 tea，或簡體中文標題是「茶葉 / 茶葉」，且簡介還是空的，就填入這段文字。
const TEA_DESCS: Record<string, string> = {
  "zh-Hant": "從山間的晨霧到一盞溫熱,每一片茶葉都記得陽光與雨水。",
};

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
  // 舊預設名稱「琥珀飾品 / 東方香品」若曾被存進標題，統一改成「飾品 / 香品」（只動完全等於舊名稱的）
  await db
    .prepare(
      `UPDATE site_categories
         SET titles = json_set(titles, '$."zh-Hant"', CASE json_extract(titles, '$."zh-Hant"')
               WHEN '琥珀飾品' THEN '飾品' WHEN '琥珀飾品' THEN '飾品'
               WHEN '東方香品' THEN '香品' WHEN '東方香品' THEN '香品' END)
       WHERE json_valid(titles)
         AND json_extract(titles, '$."zh-Hant"') IN ('琥珀飾品','琥珀飾品','東方香品','東方香品')`,
    )
    .run();
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
