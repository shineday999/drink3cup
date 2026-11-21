// 後臺產品 repository（步驟 1.3 讀取、1.4 寫入、1.5 變體與價格）
// - 所有函式第一個引數都是 D1Database，方便測試時換成假的；頁面與 API 用 getDB() 傳入
// - 不在這裡 import ../db 的執行期內容（它依賴 cloudflare:workers，測試環境載不到），只 import type
import type { Product, ProductTranslation } from "../db";
import {
  tagsFromDb,
  tagsToDb,
  type ProductCreateInput,
  type ProductUpdateInput,
  type VariantInput,
} from "../schemas/product";

// ───────────────────────── 共用 ─────────────────────────

export type RepoErrorCode =
  "not_found" | "slug_taken" | "sku_taken" | "last_variant";

export class RepoError extends Error {
  code: RepoErrorCode;
  constructor(code: RepoErrorCode, message?: string) {
    super(message ?? code);
    this.name = "RepoError";
    this.code = code;
  }
}

// created_at / updated_at 單位：Unix 秒（若專案其他地方用毫秒，只要改這一處）
const nowSec = (): number => Math.floor(Date.now() / 1000);

const newId = (prefix: string): string =>
  `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const escapeLike = (s: string): string => s.replace(/[\\%_]/g, (m) => "\\" + m);

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

function mapConstraintError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("products.slug")) throw new RepoError("slug_taken");
  if (msg.includes("product_variants.sku")) throw new RepoError("sku_taken");
  throw e;
}

/**
 * product_variants.price_base 仍是 NOT NULL，要等 6.5 移除欄位前都得寫入。
 * 取 TWD（新臺幣）價格（沒有就取第一個幣別）換成「元」字串，例如 92000 → "920.00"。
 */
export function derivePriceBase(prices: Record<string, number>): string {
  const cents = prices.TWD ?? Object.values(prices)[0];
  return cents === undefined ? "0.00" : (cents / 100).toFixed(2);
}

const firstImage = (variants: VariantInput[]): string | null =>
  variants.find((v) => v.image_urls.length > 0)?.image_urls[0] ?? null;

// ───────────────────────── 1.3 讀取 ─────────────────────────

export interface ListProductsParams {
  q?: string;
  status?: Product["status"];
  category?: string;
  locale?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListItem {
  id: string;
  slug: string;
  category: string;
  subcategory: string | null;
  status: Product["status"];
  image_url: string | null;
  tags: string[];
  name: string | null;
  variant_count: number;
  created_at: number;
  updated_at: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface ListRow {
  id: string;
  slug: string;
  category: string;
  subcategory: string | null;
  status: Product["status"];
  image_url: string | null;
  tags: string;
  name: string | null;
  variant_count: number;
  created_at: number;
  updated_at: number;
}

export async function listProducts(
  db: D1Database,
  params: ListProductsParams = {},
): Promise<Page<ProductListItem>> {
  const locale = params.locale ?? "zh-Hant";
  const pageSize = clamp(Math.trunc(params.pageSize ?? 20), 1, 100);
  const page = Math.max(1, Math.trunc(params.page ?? 1));

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (params.status) {
    where.push("p.status = ?");
    args.push(params.status);
  }
  if (params.category) {
    where.push("p.category = ?");
    args.push(params.category);
  }
  const q = params.q?.trim();
  if (q) {
    const like = `%${escapeLike(q)}%`;
    where.push(
      `(p.slug LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM product_translations t WHERE t.product_id = p.id AND t.name LIKE ? ESCAPE '\\'))`,
    );
    args.push(like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM products p ${whereSql}`)
    .bind(...args)
    .first<{ n: number }>();

  const { results } = await db
    .prepare(
      `SELECT p.id, p.slug, p.category, p.subcategory, p.status, p.image_url, p.tags,
              p.created_at, p.updated_at,
              COALESCE(
                (SELECT name FROM product_translations WHERE product_id = p.id AND locale = ?),
                (SELECT name FROM product_translations WHERE product_id = p.id AND locale = 'zh-Hant')
              ) AS name,
              (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) AS variant_count
         FROM products p
         ${whereSql}
        ORDER BY p.created_at DESC, p.id ASC
        LIMIT ? OFFSET ?`,
    )
    .bind(locale, ...args, pageSize, (page - 1) * pageSize)
    .all<ListRow>();

  return {
    items: results.map((r) => ({ ...r, tags: tagsFromDb(r.tags) })),
    total: totalRow?.n ?? 0,
    page,
    pageSize,
  };
}

export interface VariantDetail {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  weight_grams: number | null;
  image_urls: string[];
  prices: Record<string, number>;
}

export type FaqMap = Record<string, { q: string; a: string }[]>;

export interface ProductDetail {
  id: string;
  category: string;
  subcategory: string | null;
  slug: string;
  status: Product["status"];
  image_url: string | null;
  tags: string[];
  faq: FaqMap;
  created_at: number;
  updated_at: number;
  translations: ProductTranslation[];
  variants: VariantDetail[];
}

interface ProductRow {
  id: string;
  category: string;
  subcategory: string | null;
  slug: string;
  status: Product["status"];
  image_url: string | null;
  tags: string;
  faq: string | null;
  created_at: number;
  updated_at: number;
}

interface VariantRow {
  id: string;
  product_id: string;
  sku: string;
  attributes: string;
  stock: number;
  weight_grams: number | null;
  image_urls: string;
}

export async function getProduct(
  db: D1Database,
  id: string,
): Promise<ProductDetail | null> {
  const p = await db
    .prepare(
      `SELECT id, category, subcategory, slug, status, image_url, tags, faq, created_at, updated_at
         FROM products WHERE id = ?`,
    )
    .bind(id)
    .first<ProductRow>();
  if (!p) return null;

  const [tr, vr, pr] = await Promise.all([
    db
      .prepare(
        `SELECT product_id, locale, name, description, short_description, story, meta_title, meta_description
           FROM product_translations WHERE product_id = ? ORDER BY locale`,
      )
      .bind(id)
      .all<ProductTranslation>(),
    db
      .prepare(
        `SELECT id, product_id, sku, attributes, stock, weight_grams, image_urls
           FROM product_variants WHERE product_id = ? ORDER BY sku`,
      )
      .bind(id)
      .all<VariantRow>(),
    db
      .prepare(
        `SELECT variant_id, currency, amount FROM product_prices
          WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)
          ORDER BY variant_id, currency`,
      )
      .bind(id)
      .all<{ variant_id: string; currency: string; amount: number }>(),
  ]);

  const pricesByVariant = new Map<string, Record<string, number>>();
  for (const row of pr.results) {
    const m = pricesByVariant.get(row.variant_id) ?? {};
    m[row.currency] = row.amount;
    pricesByVariant.set(row.variant_id, m);
  }

  return {
    id: p.id,
    category: p.category,
    subcategory: p.subcategory,
    slug: p.slug,
    status: p.status,
    image_url: p.image_url,
    tags: tagsFromDb(p.tags),
    faq: parseJson<FaqMap>(p.faq, {}),
    created_at: p.created_at,
    updated_at: p.updated_at,
    translations: tr.results,
    variants: vr.results.map((v) => ({
      id: v.id,
      product_id: v.product_id,
      sku: v.sku,
      attributes: parseJson<Record<string, string>>(v.attributes, {}),
      stock: v.stock,
      weight_grams: v.weight_grams,
      image_urls: parseJson<string[]>(v.image_urls, []),
      prices: pricesByVariant.get(v.id) ?? {},
    })),
  };
}

export async function isSlugTaken(
  db: D1Database,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const row = excludeId
    ? await db
        .prepare(
          "SELECT 1 AS x FROM products WHERE slug = ? AND id <> ? LIMIT 1",
        )
        .bind(slug, excludeId)
        .first()
    : await db
        .prepare("SELECT 1 AS x FROM products WHERE slug = ? LIMIT 1")
        .bind(slug)
        .first();
  return row !== null;
}

// ───────────────────────── 1.4 寫入 ─────────────────────────

function translationStmts(
  db: D1Database,
  productId: string,
  translations: ProductCreateInput["translations"],
): D1PreparedStatement[] {
  return translations.map((t) =>
    db
      .prepare(
        `INSERT INTO product_translations
           (product_id, locale, name, description, short_description, story, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        productId,
        t.locale,
        t.name,
        t.description,
        t.short_description ?? null,
        t.story ?? null,
        t.meta_title ?? null,
        t.meta_description ?? null,
      ),
  );
}

function priceStmts(
  db: D1Database,
  variantId: string,
  prices: Record<string, number>,
): D1PreparedStatement[] {
  return Object.entries(prices).map(([currency, amount]) =>
    db
      .prepare(
        "INSERT INTO product_prices (variant_id, currency, amount) VALUES (?, ?, ?)",
      )
      .bind(variantId, currency, amount),
  );
}

function insertVariantStmts(
  db: D1Database,
  productId: string,
  variantId: string,
  v: VariantInput,
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO product_variants
           (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        variantId,
        productId,
        v.sku,
        JSON.stringify(v.attributes),
        v.stock,
        v.weight_grams ?? null,
        derivePriceBase(v.prices),
        JSON.stringify(v.image_urls),
      ),
    ...priceStmts(db, variantId, v.prices),
  ];
}

/** 一次建立商品、翻譯、變體、價格（D1 batch，全成功或全失敗）。回傳新商品 id。 */
export async function createProduct(
  db: D1Database,
  input: ProductCreateInput,
): Promise<string> {
  if (await isSlugTaken(db, input.slug)) throw new RepoError("slug_taken");

  const id = newId("prod");
  const ts = nowSec();
  const stmts: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO products
           (id, category, subcategory, slug, status, created_at, updated_at, image_url, tags, faq)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.category,
        input.subcategory ?? null,
        input.slug,
        input.status,
        ts,
        ts,
        input.image_url ?? firstImage(input.variants),
        tagsToDb(input.tags),
        JSON.stringify(input.faq),
      ),
    ...translationStmts(db, id, input.translations),
  ];
  for (const v of input.variants) {
    stmts.push(...insertVariantStmts(db, id, newId("var"), v));
  }

  try {
    await db.batch(stmts);
  } catch (e) {
    mapConstraintError(e);
  }
  return id;
}

/** 變體請走 upsertVariant / deleteVariant，這裡不處理。translations 有帶就整組取代。 */
export type ProductPatch = Omit<ProductUpdateInput, "variants">;

export async function updateProduct(
  db: D1Database,
  id: string,
  patch: ProductPatch,
): Promise<void> {
  const exists = await db
    .prepare("SELECT 1 AS x FROM products WHERE id = ?")
    .bind(id)
    .first();
  if (!exists) throw new RepoError("not_found");
  if (patch.slug !== undefined && (await isSlugTaken(db, patch.slug, id))) {
    throw new RepoError("slug_taken");
  }

  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  const add = (col: string, val: string | number | null) => {
    sets.push(`${col} = ?`);
    args.push(val);
  };
  if (patch.category !== undefined) add("category", patch.category);
  if (patch.subcategory !== undefined) add("subcategory", patch.subcategory);
  if (patch.slug !== undefined) add("slug", patch.slug);
  if (patch.status !== undefined) add("status", patch.status);
  if (patch.tags !== undefined) add("tags", tagsToDb(patch.tags));
  if (patch.image_url !== undefined) add("image_url", patch.image_url);
  if (patch.faq !== undefined) add("faq", JSON.stringify(patch.faq));
  add("updated_at", nowSec());

  const stmts: D1PreparedStatement[] = [
    db
      .prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...args, id),
  ];
  if (patch.translations !== undefined) {
    stmts.push(
      db
        .prepare("DELETE FROM product_translations WHERE product_id = ?")
        .bind(id),
    );
    stmts.push(...translationStmts(db, id, patch.translations));
  }

  try {
    await db.batch(stmts);
  } catch (e) {
    mapConstraintError(e);
  }
}

export async function setProductStatus(
  db: D1Database,
  id: string,
  status: Product["status"],
): Promise<void> {
  await updateProduct(db, id, { status });
}

/** 直接刪除商品；翻譯、變體、價格、評論由外部索引鍵 ON DELETE CASCADE 一併刪除。 */
export async function deleteProduct(
  db: D1Database,
  id: string,
): Promise<boolean> {
  const res = await db
    .prepare("DELETE FROM products WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// ───────────────────────── 1.5 變體與價格 ─────────────────────────

/** 有 v.id 就更新（價格整組取代），沒有就新增。回傳變體 id。 */
export async function upsertVariant(
  db: D1Database,
  productId: string,
  v: VariantInput,
): Promise<string> {
  const product = await db
    .prepare("SELECT 1 AS x FROM products WHERE id = ?")
    .bind(productId)
    .first();
  if (!product) throw new RepoError("not_found");

  const ts = nowSec();
  const touch = db
    .prepare("UPDATE products SET updated_at = ? WHERE id = ?")
    .bind(ts, productId);
  let stmts: D1PreparedStatement[];
  let variantId: string;

  if (v.id) {
    const own = await db
      .prepare(
        "SELECT 1 AS x FROM product_variants WHERE id = ? AND product_id = ?",
      )
      .bind(v.id, productId)
      .first();
    if (!own) throw new RepoError("not_found");
    variantId = v.id;
    stmts = [
      db
        .prepare(
          `UPDATE product_variants
              SET sku = ?, attributes = ?, stock = ?, weight_grams = ?, price_base = ?, image_urls = ?
            WHERE id = ? AND product_id = ?`,
        )
        .bind(
          v.sku,
          JSON.stringify(v.attributes),
          v.stock,
          v.weight_grams ?? null,
          derivePriceBase(v.prices),
          JSON.stringify(v.image_urls),
          variantId,
          productId,
        ),
      db
        .prepare("DELETE FROM product_prices WHERE variant_id = ?")
        .bind(variantId),
      ...priceStmts(db, variantId, v.prices),
      touch,
    ];
  } else {
    variantId = newId("var");
    stmts = [...insertVariantStmts(db, productId, variantId, v), touch];
  }

  try {
    await db.batch(stmts);
  } catch (e) {
    mapConstraintError(e);
  }
  return variantId;
}

/** 只更新某個變體的價格（整組取代）。 */
export async function setVariantPrices(
  db: D1Database,
  productId: string,
  variantId: string,
  prices: Record<string, number>,
): Promise<void> {
  const own = await db
    .prepare(
      "SELECT 1 AS x FROM product_variants WHERE id = ? AND product_id = ?",
    )
    .bind(variantId, productId)
    .first();
  if (!own) throw new RepoError("not_found");

  await db.batch([
    db
      .prepare("DELETE FROM product_prices WHERE variant_id = ?")
      .bind(variantId),
    ...priceStmts(db, variantId, prices),
    db
      .prepare("UPDATE product_variants SET price_base = ? WHERE id = ?")
      .bind(derivePriceBase(prices), variantId),
    db
      .prepare("UPDATE products SET updated_at = ? WHERE id = ?")
      .bind(nowSec(), productId),
  ]);
}

/** 商品至少要留一個變體，刪最後一個會丟 last_variant。價格由外部索引鍵一併刪除。 */
export async function deleteVariant(
  db: D1Database,
  productId: string,
  variantId: string,
): Promise<void> {
  const own = await db
    .prepare(
      "SELECT 1 AS x FROM product_variants WHERE id = ? AND product_id = ?",
    )
    .bind(variantId, productId)
    .first();
  if (!own) throw new RepoError("not_found");

  const count = await db
    .prepare("SELECT COUNT(*) AS n FROM product_variants WHERE product_id = ?")
    .bind(productId)
    .first<{ n: number }>();
  if ((count?.n ?? 0) <= 1) throw new RepoError("last_variant");

  await db.batch([
    db
      .prepare("DELETE FROM product_variants WHERE id = ? AND product_id = ?")
      .bind(variantId, productId),
    db
      .prepare("UPDATE products SET updated_at = ? WHERE id = ?")
      .bind(nowSec(), productId),
  ]);
}
