// 商品描述試算表同步：解析「發布到網路」的 CSV，找出某個商品那一列的簡介／描述（目前只有繁體中文）。
// 試算表第一列是標題列，必須有 slug 欄，以及「<語言> 簡介」「<語言> 描述」欄（欄位順序不拘）。

export const SHEET_LOCALES = ["zh-Hant"] as const;
export type SheetLocale = (typeof SHEET_LOCALES)[number];

export interface SheetFill {
  short_description?: string;
  description?: string;
}
export type SheetFills = Partial<Record<SheetLocale, SheetFill>>;

interface SheetColumn {
  header: string;
  locale: SheetLocale;
  field: keyof SheetFill;
}

export const SHEET_COLUMNS: SheetColumn[] = SHEET_LOCALES.flatMap((locale) => [
  { header: `${locale} 簡介`, locale, field: "short_description" as const },
  { header: `${locale} 描述`, locale, field: "description" as const },
]);

export type SheetLookup =
  | { ok: true; fills: SheetFills; filled: number; missing: string[] }
  | { ok: false; error: "empty" | "no_slug_column" | "not_found" };

/** 解析 CSV（RFC 4180）：支援引號、引號內換行、CRLF、BOM。 */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (inQuotes) {
      if (ch === '"') {
        if (text.charAt(i + 1) === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text.charAt(i + 1) === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const normHeader = (s: string) => s.replace(/\s+/g, " ").trim();

/** 依 slug 找出那一列；空白格子略過（不會蓋掉後臺現有內容）。 */
export function findProductRow(rows: string[][], slug: string): SheetLookup {
  const header = rows[0];
  if (!header) return { ok: false, error: "empty" };
  const heads = header.map(normHeader);
  const slugCol = heads.findIndex((h) => h.toLowerCase() === "slug");
  if (slugCol < 0) return { ok: false, error: "no_slug_column" };

  const want = slug.trim();
  const row = rows.slice(1).find((r) => (r[slugCol] ?? "").trim() === want);
  if (!row) return { ok: false, error: "not_found" };

  const fills: SheetFills = {};
  const missing: string[] = [];
  let filled = 0;
  for (const col of SHEET_COLUMNS) {
    const idx = heads.indexOf(col.header);
    if (idx < 0) {
      missing.push(col.header);
      continue;
    }
    const value = (row[idx] ?? "").replace(/\r\n?/g, "\n").trim();
    if (value === "") continue;
    const target = fills[col.locale] ?? {};
    target[col.field] = value;
    fills[col.locale] = target;
    filled++;
  }
  return { ok: true, fills, filled, missing };
}

// 維護用的 Google 試算表（放在 Drive「龍蝦廣場」資料夾）；後臺的「開啟表格」連結用
export const PRODUCT_SHEET_EDIT_URL =
  "https://docs.google.com/spreadsheets/d/1_TdcQ2Ymd5c0wzuodz-gOjSYoWvtDE4wBC_bnGbgRqI/edit";
