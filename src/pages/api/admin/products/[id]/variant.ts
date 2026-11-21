import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../../../lib/db";
import {
  MAX_IMAGES,
  checkImages,
  deleteImages,
  newId,
  parsePrice,
  pickImages,
  toFen,
  uniqueSku,
  uploadImages,
} from "../../../../../lib/admin-products";

// 儲存商品的規格：售價（新台幣，單位分）、庫存、重量、圖片。
// 還沒有規格的舊商品（只有封面圖）也從這裡補齊。
export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const back = (qs: string) =>
    ctx.redirect(`/admin/products/${id}?tab=variants&${qs}`, 303);
  const fail = (msg: string) => back(`error=${encodeURIComponent(msg)}`);

  const db = getDB();
  const product = await db
    .prepare("SELECT id, slug, status, image_url FROM products WHERE id = ?")
    .bind(id)
    .first<{
      id: string;
      slug: string;
      status: string;
      image_url: string | null;
    }>();
  if (!product) return new Response("Not found", { status: 404 });

  const form = await ctx.request.formData();

  // ---- 欄位驗證 ----
  const price = parsePrice(String(form.get("price") ?? ""));
  const stock = Number(String(form.get("stock") ?? ""));
  const weightRaw = String(form.get("weight") ?? "").trim();
  if (price === null) return fail("请填写大于 0 的售价（新台幣）");
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    return fail("库存需为 0 以上的整数");
  }
  let weight: number | null = null;
  if (weightRaw) {
    const w = Number(weightRaw);
    if (!Number.isFinite(w) || w < 0 || w > 1_000_000) {
      return fail("重量需为 0 以上的数字（克）");
    }
    weight = Math.round(w);
  }

  // ---- 現有規格與圖片（以資料庫為準，不信任表單送來的網址） ----
  const variant = await db
    .prepare(
      "SELECT id, sku, image_urls FROM product_variants WHERE product_id = ? ORDER BY sku LIMIT 1",
    )
    .bind(id)
    .first<{ id: string; sku: string; image_urls: string }>();

  let current: string[] = [];
  try {
    const parsed: unknown = variant ? JSON.parse(variant.image_urls) : [];
    if (Array.isArray(parsed)) {
      current = parsed.filter((u): u is string => typeof u === "string");
    }
  } catch {
    current = [];
  }
  // 舊資料：只有 products.image_url 的，帶進規格
  if (current.length === 0 && product.image_url) current = [product.image_url];

  const removeSet = new Set(form.getAll("remove").map(String));
  let keep = current.filter((u) => !removeSet.has(u));
  const cover = String(form.get("cover") ?? "");
  if (cover && keep.includes(cover)) {
    keep = [cover, ...keep.filter((u) => u !== cover)];
  }

  const files = pickImages(form);
  const imgErr = checkImages(files);
  if (imgErr) return fail(imgErr);
  if (keep.length + files.length > MAX_IMAGES) {
    return fail(`最多 ${MAX_IMAGES} 张图片（含已有的），请先删除一些`);
  }
  if (product.status === "active" && keep.length + files.length === 0) {
    return fail("已上架的商品至少要保留 1 张图片（请先下架再删除）");
  }

  const r2 = env.PRODUCT_IMAGES;
  if (files.length > 0 && !r2) return fail("R2 未绑定，无法上传图片");
  const newUrls =
    files.length > 0
      ? await uploadImages(r2, id, files, current.length + 1)
      : [];
  const finalUrls = [...keep, ...newUrls];

  // ---- 寫入（同一個交易） ----
  const now = Math.floor(Date.now() / 1000);
  const fen = toFen(price);
  const priceBase = (fen / 100).toFixed(2);
  const variantId = variant?.id ?? newId("var");

  const stmts: D1PreparedStatement[] = [];
  if (variant) {
    stmts.push(
      db
        .prepare(
          "UPDATE product_variants SET stock = ?, weight_grams = ?, price_base = ?, image_urls = ? WHERE id = ?",
        )
        .bind(stock, weight, priceBase, JSON.stringify(finalUrls), variantId),
    );
  } else {
    const sku = await uniqueSku(db, product.slug);
    stmts.push(
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
          JSON.stringify(finalUrls),
        ),
    );
  }
  stmts.push(
    db
      .prepare(
        "INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES (?, 'TWD', ?, 1) ON CONFLICT (variant_id, currency) DO UPDATE SET amount = excluded.amount",
      )
      .bind(variantId, fen),
  );
  stmts.push(
    db
      .prepare("UPDATE products SET image_url = ?, updated_at = ? WHERE id = ?")
      .bind(finalUrls[0] ?? null, now, id),
  );

  try {
    await db.batch(stmts);
  } catch (e) {
    if (r2) await deleteImages(r2, newUrls);
    return fail(e instanceof Error ? e.message : "保存失败，请稍后重试");
  }

  // 資料庫寫入成功後，再清掉被刪除的舊圖
  if (r2)
    await deleteImages(
      r2,
      current.filter((u) => removeSet.has(u)),
    );

  return back("saved=1");
};
