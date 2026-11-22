// 商品「試算表 ⇄ 網站資料庫」雙向同步的網站端。
// Apps Script 每分鐘呼叫 /api/sync/products:GET 取得全部商品,POST 寫入表格改過的列。
// 規則:空白格子不會蓋掉網站現有內容;價格以新台幣(元)為單位;不同步刪除。
import { getDB } from "./db";

export const SYNC_LOCALES = ["zh-Hant", "en", "ms-MY", "id-ID"] as const;

const TEXT_FIELDS = [
  { key: "name", label: "名稱" },
  { key: "short_description", label: "簡介" },
  { key: "description", label: "描述" },
] as const;
type TextKey = (typeof TEXT_FIELDS)[number]["key"];
type TextSet = Partial<Record<TextKey, string>>;

/** 表格欄位標題(Apps Script 會從 API 取得,不需要在兩邊重複維護) */
export const SYNC_HEADERS: string[] = [
  "slug",
  "分類",
  "狀態",
  ...SYNC_LOCALES.flatMap((l) => TEXT_FIELDS.map((f) => `${l} ${f.label}`)),
  "售價",
];

export type SyncRow = Record<string, string | number>;

export interface ImportResult {
  slug: string;
  ok: boolean;
  action?: "created" | "updated" | "unchanged";
  warning?: string;
  error?: string;
}

// 分類:資料庫代碼 ⇄ 表格顯示名稱(S06 路由改名後,只需改這裡)
const CATEGORY_LABELS: Record<string, string> = {
  jewelry: "咖啡豆",
  incense: "沖煮器具",
};
const CATEGORY_ALIASES: Record<string, string> = {
  beans: "jewelry",
  brewing: "incense",
  equipment: "incense",
};

function categoryFromInput(v: string): string | null {
  for (const [code, label] of Object.entries(CATEGORY_LABELS)) {
    if (v === label || v === code) return code;
  }
  return CATEGORY_ALIASES[v] ?? null;
}

function statusFromInput(v: string): string | null {
  if (v === "上架" || v === "active") return "active";
  if (v === "下架" || v === "draft") return "draft";
  return null;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,98}$/;

export async function exportRows(slugs?: string[]): Promise<SyncRow[]> {
  const db = getDB();
  const list = slugs ?? [];
  const where =
    list.length > 0 ? `WHERE slug IN (${list.map(() => "?").join(",")})` : "";

  const products =
    (
      await db
        .prepare(
          `SELECT id, slug, category, status FROM products ${where} ORDER BY created_at, slug`,
        )
        .bind(...list)
        .all<{ id: string; slug: string; category: string; status: string }>()
    ).results ?? [];

  const trans =
    (
      await db
        .prepare(
          "SELECT product_id, locale, name, short_description, description FROM product_translations",
        )
        .all<{
          product_id: string;
          locale: string;
          name: string | null;
          short_description: string | null;
          description: string | null;
        }>()
    ).results ?? [];
  const trMap = new Map(trans.map((t) => [`${t.product_id}|${t.locale}`, t]));

  const prices =
    (
      await db
        .prepare(
          `SELECT pv.product_id AS product_id, pp.amount AS amount
             FROM product_variants pv
             JOIN product_prices pp ON pp.variant_id = pv.id AND pp.currency = 'TWD'
            ORDER BY pv.sku`,
        )
        .all<{ product_id: string; amount: number }>()
    ).results ?? [];
  const priceMap = new Map<string, number>();
  for (const p of prices) {
    if (!priceMap.has(p.product_id)) priceMap.set(p.product_id, p.amount);
  }

  return products.map((p) => {
    const row: SyncRow = {
      slug: p.slug,
      分類: CATEGORY_LABELS[p.category] ?? p.category,
      狀態: p.status === "active" ? "上架" : "下架",
    };
    for (const l of SYNC_LOCALES) {
      const t = trMap.get(`${p.id}|${l}`);
      for (const f of TEXT_FIELDS) {
        row[`${l} ${f.label}`] = t?.[f.key] ?? "";
      }
    }
    const cents = priceMap.get(p.id);
    row["售價"] = cents === undefined ? "" : cents / 100;
    return row;
  });
}

function otherCurrencies(db: D1Database, productId: string) {
  return db
    .prepare(
      `INSERT OR REPLACE INTO product_prices (variant_id, currency, amount, tax_included)
       SELECT p.variant_id, r.currency, CAST(ROUND(p.amount * r.per_cny) AS INTEGER), 1
         FROM product_prices p
         JOIN product_variants v ON v.id = p.variant_id
         JOIN exchange_rates r ON r.currency != 'TWD'
        WHERE v.product_id = ? AND p.currency = 'TWD'`,
    )
    .bind(productId);
}

export async function importRow(
  row: Record<string, unknown>,
): Promise<ImportResult> {
  const str = (k: string) =>
    String(row[k] ?? "")
      .replace(/\r\n?/g, "\n")
      .trim();
  const slug = str("slug");
  const fail = (error: string): ImportResult => ({ slug, ok: false, error });

  if (!SLUG_RE.test(slug)) return fail("slug 只能用小寫英文、數字與連字號");

  const texts: Partial<Record<(typeof SYNC_LOCALES)[number], TextSet>> = {};
  for (const l of SYNC_LOCALES) {
    const t: TextSet = {};
    for (const f of TEXT_FIELDS) {
      const v = str(`${l} ${f.label}`);
      if (v) t[f.key] = v;
    }
    if (Object.keys(t).length > 0) texts[l] = t;
  }

  const catIn = str("分類");
  const category = catIn ? categoryFromInput(catIn) : null;
  if (catIn && !category) return fail(`看不懂的分類:${catIn}`);

  const stIn = str("狀態");
  const status = stIn ? statusFromInput(stIn) : null;
  if (stIn && !status) return fail(`看不懂的狀態:${stIn}(請填 上架 或 下架)`);

  const priceRaw = str("售價").replace(/,/g, "");
  let price: number | null = null;
  if (priceRaw !== "") {
    price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) {
      return fail(`售價不正確:${priceRaw}`);
    }
  }

  const db = getDB();
  const now = Math.floor(Date.now() / 1000);
  const stmts: D1PreparedStatement[] = [];
  let warning: string | undefined;

  const existing = await db
    .prepare("SELECT id, category, status FROM products WHERE slug = ?")
    .bind(slug)
    .first<{ id: string; category: string; status: string }>();

  let productId: string;

  if (!existing) {
    if (!texts["zh-Hant"]?.name) return fail("新商品至少要填 zh-Hant 名稱");
    productId = "prod_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const variantId =
      "var_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const sku = ("SKU-" + slug).slice(0, 60).toUpperCase();
    stmts.push(
      db
        .prepare(
          "INSERT INTO products (id, category, subcategory, slug, status, created_at, updated_at) VALUES (?, ?, NULL, ?, ?, ?, ?)",
        )
        .bind(
          productId,
          category ?? "jewelry",
          slug,
          status ?? "draft",
          now,
          now,
        ),
      db
        .prepare(
          "INSERT INTO product_variants (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls) VALUES (?, ?, ?, '{}', 0, NULL, ?, '[]')",
        )
        .bind(
          variantId,
          productId,
          sku,
          price === null ? "0.00" : price.toFixed(2),
        ),
    );
    if (price !== null) {
      stmts.push(
        db
          .prepare(
            "INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES (?, 'TWD', ?, 1)",
          )
          .bind(variantId, Math.round(price * 100)),
        otherCurrencies(db, productId),
      );
    }
  } else {
    productId = existing.id;
    const sets: string[] = [];
    const vals: (string | number)[] = [];
    if (category && category !== existing.category) {
      sets.push("category = ?");
      vals.push(category);
    }
    if (status && status !== existing.status) {
      sets.push("status = ?");
      vals.push(status);
    }
    if (sets.length > 0) {
      stmts.push(
        db
          .prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`)
          .bind(...vals, productId),
      );
    }

    if (price !== null) {
      const cents = Math.round(price * 100);
      const vs =
        (
          await db
            .prepare(
              `SELECT pv.id AS id, pp.amount AS amount
                 FROM product_variants pv
                 LEFT JOIN product_prices pp ON pp.variant_id = pv.id AND pp.currency = 'TWD'
                WHERE pv.product_id = ?`,
            )
            .bind(productId)
            .all<{ id: string; amount: number | null }>()
        ).results ?? [];
      if (vs.length === 0) {
        warning = "此商品沒有規格,價格未更新";
      } else if (new Set(vs.map((v) => v.amount)).size > 1) {
        warning = "各規格價格不同,價格未更新,請到後台修改";
      } else if (vs[0]?.amount !== cents) {
        stmts.push(
          db
            .prepare(
              "UPDATE product_variants SET price_base = ? WHERE product_id = ?",
            )
            .bind(price.toFixed(2), productId),
        );
        for (const v of vs) {
          stmts.push(
            db
              .prepare(
                "INSERT OR REPLACE INTO product_prices (variant_id, currency, amount, tax_included) VALUES (?, 'TWD', ?, 1)",
              )
              .bind(v.id, cents),
          );
        }
        stmts.push(otherCurrencies(db, productId));
      }
    }
  }

  // 翻譯:只寫入有填的欄位
  const existingTr = new Map<
    string,
    {
      name: string | null;
      short_description: string | null;
      description: string | null;
    }
  >();
  if (existing) {
    const r = await db
      .prepare(
        "SELECT locale, name, short_description, description FROM product_translations WHERE product_id = ?",
      )
      .bind(productId)
      .all<{
        locale: string;
        name: string | null;
        short_description: string | null;
        description: string | null;
      }>();
    for (const x of r.results ?? []) existingTr.set(x.locale, x);
  }
  for (const loc of SYNC_LOCALES) {
    const t = texts[loc];
    if (!t) continue;
    const cur = existingTr.get(loc);
    if (cur) {
      const sets: string[] = [];
      const vals: string[] = [];
      for (const f of TEXT_FIELDS) {
        const nv = t[f.key];
        if (nv !== undefined && nv !== (cur[f.key] ?? "")) {
          sets.push(`${f.key} = ?`);
          vals.push(nv);
        }
      }
      if (sets.length > 0) {
        stmts.push(
          db
            .prepare(
              `UPDATE product_translations SET ${sets.join(", ")} WHERE product_id = ? AND locale = ?`,
            )
            .bind(...vals, productId, loc),
        );
      }
    } else {
      const name =
        t.name ??
        texts["zh-Hant"]?.name ??
        existingTr.get("zh-Hant")?.name ??
        slug;
      stmts.push(
        db
          .prepare(
            "INSERT INTO product_translations (product_id, locale, name, description, short_description, story) VALUES (?, ?, ?, ?, ?, '')",
          )
          .bind(
            productId,
            loc,
            name,
            t.description ?? "",
            t.short_description ?? "",
          ),
      );
    }
  }

  if (existing && stmts.length > 0) {
    stmts.push(
      db
        .prepare("UPDATE products SET updated_at = ? WHERE id = ?")
        .bind(now, productId),
    );
  }
  if (stmts.length > 0) await db.batch(stmts);

  return {
    slug,
    ok: true,
    action: !existing ? "created" : stmts.length > 0 ? "updated" : "unchanged",
    warning,
  };
}
