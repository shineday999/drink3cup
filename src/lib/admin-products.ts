// 後台商品共用邏輯：自動編號、價格換算、標籤預設、圖片處理、新增與上架檢查
// 注意：這裡不 import "./db"（它會載入 cloudflare:workers），方便在 Node 內單元測試。
import { JEWELRY_STEPS, INCENSE_STEPS, TEA_STEPS, type QuizStep } from "./quiz";
import type { QuizKind } from "./category-kind";

// ---------- 分類 / 子分類 ----------
export const CATEGORIES = ["jewelry", "incense"] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}

/** 後台「分类图片」可以新增分類；新增商品時可選的分類 = 那裡的分類代碼（沒傳就只認內建兩個）。 */
function isAllowedCategory(v: string, validCodes?: readonly string[]): boolean {
  return (validCodes ?? CATEGORIES).includes(v);
}

export const SUBCATEGORIES: Record<Category, readonly string[]> = {
  jewelry: ["necklace", "bracelet", "earring", "ring"],
  incense: ["stick", "balm", "oil"],
};

// ---------- 標籤預設（來源：測驗各題的答案值，「为我推荐」靠它們比對） ----------
export interface TagGroup {
  id: string;
  titleKey: string;
  options: { value: string; labelKey: string }[];
}

function toGroups(steps: QuizStep[]): TagGroup[] {
  return steps.map((s) => ({
    id: s.id,
    titleKey: s.titleKey,
    // 「any（不限）」不是商品特性，不列為標籤
    options: s.options.filter((o) => o.value !== "any"),
  }));
}

export const TAG_GROUPS: Record<QuizKind, TagGroup[]> = {
  jewelry: toGroups(JEWELRY_STEPS),
  incense: toGroups(INCENSE_STEPS),
  tea: toGroups(TEA_STEPS),
};

export function allowedTags(category: QuizKind): Set<string> {
  const set = new Set<string>();
  for (const g of TAG_GROUPS[category])
    for (const o of g.options) set.add(o.value);
  return set;
}

export function splitTags(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** 勾選的標籤只收該分類的預設值；extra 是舊資料裡預設清單以外的標籤，原樣保留。 */
export function buildTags(
  category: QuizKind,
  checked: string[],
  extra: string[] = [],
): string {
  const allowed = allowedTags(category);
  const out: string[] = [];
  for (const v of checked) if (allowed.has(v) && !out.includes(v)) out.push(v);
  for (const v of extra) {
    if (/^[a-z0-9_-]+$/i.test(v) && !out.includes(v)) out.push(v);
  }
  return out.join(",");
}

// ---------- 自動編號 ----------
/** 台灣時間（UTC+8）的 YYYYMMDD */
export function todayStamp(now: number = Date.now()): string {
  const d = new Date(now + 8 * 3600 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function slugifyEnglish(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

export async function uniqueSlug(
  db: D1Database,
  base: string,
): Promise<string> {
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const hit = await db
      .prepare("SELECT 1 AS x FROM products WHERE slug = ?")
      .bind(candidate)
      .first();
    if (!hit) return candidate;
  }
  throw new Error("编号冲突过多，请稍后重试");
}

export async function uniqueSku(db: D1Database, slug: string): Promise<string> {
  for (let n = 1; n < 100; n++) {
    const sku = `${slug}-${String(n).padStart(2, "0")}`;
    const hit = await db
      .prepare("SELECT 1 AS x FROM product_variants WHERE sku = ?")
      .bind(sku)
      .first();
    if (!hit) return sku;
  }
  throw new Error("规格编号冲突过多，请稍后重试");
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

// ---------- 價格 ----------
// 售價以新台幣（TWD）記錄：product_prices 的 TWD 列，amount 單位為分。
// 各語言前台再依匯率表（exchange_rates）換算成當地貨幣顯示。
export const PRICE_CURRENCY = "TWD";

export function parsePrice(raw: string): number | null {
  const n = Number(raw.replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 && n < 10_000_000 ? n : null;
}

/** 元 → 分（四捨五入到分） */
export function toFen(yuan: number): number {
  return Math.round(yuan * 100);
}

// ---------- 圖片 ----------
export const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function pickImages(form: FormData, field = "images"): File[] {
  return form
    .getAll(field)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

export function checkImages(files: File[]): string | null {
  if (files.length > MAX_IMAGES) return `最多上传 ${MAX_IMAGES} 张图片`;
  for (const f of files) {
    if (!IMAGE_EXT[f.type]) {
      return `不支持的图片格式：${f.name}（仅支持 JPG / PNG / WebP / GIF）`;
    }
    if (f.size > MAX_IMAGE_BYTES) return `图片过大：${f.name}（单张上限 5MB）`;
  }
  return null;
}

export async function uploadImages(
  r2: R2Bucket,
  productId: string,
  files: File[],
  startIndex = 1,
): Promise<string[]> {
  const urls: string[] = [];
  let i = startIndex;
  for (const f of files) {
    const ext = IMAGE_EXT[f.type] ?? "jpg";
    const key = `products/${productId}/img-${i}-${Date.now()}.${ext}`;
    await r2.put(key, f.stream(), { httpMetadata: { contentType: f.type } });
    urls.push(`/api/images/${key}`);
    i += 1;
  }
  return urls;
}

const IMAGE_URL_PREFIX = "/api/images/";

export async function deleteImages(
  r2: R2Bucket,
  urls: string[],
): Promise<void> {
  for (const u of urls) {
    if (!u.startsWith(IMAGE_URL_PREFIX)) continue;
    try {
      await r2.delete(u.slice(IMAGE_URL_PREFIX.length));
    } catch {
      /* 刪不掉就留著，不影響主要流程 */
    }
  }
}

// ---------- 新增商品 ----------
export interface NewProductValues {
  category: string;
  subcategory: string;
  name_zh: string;
  name_en: string;
  short_zh: string;
  desc_zh: string;
  price: string;
  stock: string;
  weight: string;
  tags: string[];
}

export function emptyNewProduct(defaultCategory = "jewelry"): NewProductValues {
  return {
    category: defaultCategory,
    subcategory: "",
    name_zh: "",
    name_en: "",
    short_zh: "",
    desc_zh: "",
    price: "",
    stock: "1",
    weight: "",
    tags: [],
  };
}

export function readNewProductForm(form: FormData): NewProductValues {
  const s = (k: string) => String(form.get(k) ?? "").trim();
  return {
    category: s("category"),
    subcategory: s("subcategory"),
    name_zh: s("name_zh"),
    name_en: s("name_en"),
    short_zh: s("short_zh"),
    desc_zh: s("desc_zh"),
    price: s("price"),
    stock: s("stock") || "1",
    weight: s("weight"),
    tags: form.getAll("tag").map(String),
  };
}

export function validateNewProduct(
  v: NewProductValues,
  files: File[],
  validCodes?: readonly string[],
): string[] {
  const errors: string[] = [];
  if (!isAllowedCategory(v.category, validCodes)) {
    errors.push("请选择分类");
  } else if (
    v.subcategory &&
    !(isCategory(v.category) ? SUBCATEGORIES[v.category] : []).includes(
      v.subcategory,
    )
  ) {
    errors.push("子分类与分类不符");
  }
  if (!v.name_zh) errors.push("请填写中文名称");
  if (!v.name_en) {
    errors.push("請填寫英文名稱（用來自動產生商品網址與編號）");
  } else if (!slugifyEnglish(v.name_en)) {
    errors.push("英文名稱需要包含英文字母或數字（用來自動產生商品網址與編號）");
  }
  if (!v.desc_zh) errors.push("请填写中文描述");
  if (parsePrice(v.price) === null)
    errors.push("请填写大于 0 的售价（新台幣）");
  const stock = Number(v.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    errors.push("库存需为 0 以上的整数");
  }
  if (v.weight) {
    const w = Number(v.weight);
    if (!Number.isFinite(w) || w < 0 || w > 1_000_000) {
      errors.push("重量需为 0 以上的数字（克）");
    }
  }
  const imgErr = checkImages(files);
  if (imgErr) errors.push(imgErr);
  return errors;
}

export interface CreateResult {
  id: string;
  slug: string;
  sku: string;
  status: "draft" | "active";
  /** 想上架但還缺的項目（空陣列表示沒問題） */
  blocked: string[];
}

export async function createProduct(
  db: D1Database,
  r2: R2Bucket | undefined,
  v: NewProductValues,
  files: File[],
  intent: "draft" | "publish",
  validCodes?: readonly string[],
  kinds?: Record<string, QuizKind | null>,
): Promise<CreateResult> {
  if (!isAllowedCategory(v.category, validCodes)) throw new Error("分类不正确");
  if (files.length > 0 && !r2) throw new Error("R2 未绑定，无法上传图片");

  const now = Math.floor(Date.now() / 1000);
  const id = newId("prod");
  const variantId = newId("var");
  const slug = await uniqueSlug(
    db,
    `${todayStamp()}-${slugifyEnglish(v.name_en)}`,
  );
  const sku = await uniqueSku(db, slug);

  const urls = r2 && files.length > 0 ? await uploadImages(r2, id, files) : [];

  const price = parsePrice(v.price) ?? 0;
  const fen = toFen(price);
  const priceBase = (fen / 100).toFixed(2);
  const stock = parseInt(v.stock, 10);
  const weight = v.weight ? Math.round(Number(v.weight)) : null;
  // 標籤預設跟著測驗種類走（jewelry / incense / tea）；沒有測驗的自訂分類沒有標籤
  const kind =
    kinds?.[v.category] ?? (isCategory(v.category) ? v.category : null);
  const tags = kind ? buildTags(kind, v.tags) : "";

  const blocked: string[] = [];
  if (urls.length === 0) blocked.push("至少 1 张图片");
  const status: "draft" | "active" =
    intent === "publish" && blocked.length === 0 ? "active" : "draft";

  try {
    await db.batch([
      db
        .prepare(
          "INSERT INTO products (id, category, subcategory, slug, status, image_url, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          id,
          v.category,
          v.subcategory || null,
          slug,
          status,
          urls[0] ?? null,
          tags,
          now,
          now,
        ),
      db
        .prepare(
          "INSERT INTO product_translations (product_id, locale, name, description, short_description) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(id, "zh-Hant", v.name_zh, v.desc_zh, v.short_zh || null),
      db
        .prepare(
          "INSERT INTO product_variants (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          variantId,
          id,
          sku,
          "{}",
          stock,
          weight,
          priceBase,
          JSON.stringify(urls),
        ),
      db
        .prepare(
          "INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES (?, 'TWD', ?, 1)",
        )
        .bind(variantId, fen),
    ]);
  } catch (e) {
    if (r2) await deleteImages(r2, urls);
    throw e;
  }

  return { id, slug, sku, status, blocked };
}

// ---------- 上架檢查 ----------
/** 回傳還缺哪些項目；空陣列＝可以上架。判斷標準與前台實際讀取的資料一致。 */
export async function checkReadiness(
  db: D1Database,
  productId: string,
): Promise<string[]> {
  const missing: string[] = [];

  const tr = await db
    .prepare(
      "SELECT name, description FROM product_translations WHERE product_id = ? AND locale = 'zh-Hant'",
    )
    .bind(productId)
    .first<{ name: string; description: string }>();
  if (!tr?.name?.trim()) missing.push("中文名称");
  if (!tr?.description?.trim()) missing.push("中文描述");

  const variant = await db
    .prepare(
      "SELECT id, image_urls FROM product_variants WHERE product_id = ? ORDER BY sku LIMIT 1",
    )
    .bind(productId)
    .first<{ id: string; image_urls: string }>();

  if (!variant) {
    missing.push("规格（售价、库存、图片）");
    return missing;
  }

  const price = await db
    .prepare(
      "SELECT amount FROM product_prices WHERE variant_id = ? AND currency = 'TWD'",
    )
    .bind(variant.id)
    .first<{ amount: number }>();
  if (!price || price.amount <= 0) missing.push("售价");

  let imgs: unknown = [];
  try {
    imgs = JSON.parse(variant.image_urls);
  } catch {
    imgs = [];
  }
  if (!Array.isArray(imgs) || imgs.length === 0) missing.push("至少 1 张图片");

  return missing;
}
