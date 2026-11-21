// /api/admin/faqs — POST:欄位式 FAQ 批次儲存(支援 products 與 posts)
// 接收 type + item_id + faq_{loc}_q_{i} / faq_{loc}_a_{i} 欄位,
// 組回 { locale: [{q, a}] } JSON 存 products.faq 或 posts.faq。
import type { APIRoute } from "astro";
import { getDB } from "../../../lib/db";

const LOCALES = ["zh-Hans", "en", "ms-MY", "id-ID"] as const;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });

  const form = await ctx.request.formData();
  const type = String(form.get("type") ?? "products");
  const itemId = String(form.get("item_id") ?? "").trim();
  if (type !== "products" && type !== "posts") {
    return new Response("Invalid type", { status: 400 });
  }
  if (!itemId) return new Response("Missing item_id", { status: 400 });

  const db = getDB();

  // type whitelist 驗證目標存在
  let exists: { id: string } | null;
  if (type === "products") {
    exists = await db
      .prepare("SELECT id FROM products WHERE id = ?")
      .bind(itemId)
      .first<{ id: string }>();
  } else {
    exists = await db
      .prepare("SELECT id FROM posts WHERE id = ?")
      .bind(itemId)
      .first<{ id: string }>();
  }
  if (!exists) return new Response("Item not found", { status: 404 });

  // 收集欄位式輸入:faq_{loc}_q_{i} / faq_{loc}_a_{i}(index 可跳號,依序排序)
  const byLoc: Record<string, Map<number, { q: string; a: string }>> = {
    "zh-Hans": new Map(),
    en: new Map(),
    "ms-MY": new Map(),
    "id-ID": new Map(),
  };
  for (const [key, value] of form.entries()) {
    const m = /^faq_(.+?)_(q|a)_(\d+)$/.exec(key);
    if (!m) continue;
    const loc = m[1];
    const kind = m[2] as "q" | "a";
    if (!loc || !kind) continue;
    if (!(loc in byLoc)) continue;
    const idx = Number(m[3]);
    const map = byLoc[loc]!;
    const pair = map.get(idx) ?? { q: "", a: "" };
    pair[kind] = String(value ?? "");
    map.set(idx, pair);
  }

  const faq: Record<string, { q: string; a: string }[]> = {};
  for (const loc of LOCALES) {
    const map = byLoc[loc]!;
    faq[loc] = [...map.entries()]
      .sort((x, y) => x[0] - y[0])
      .map(([, pair]) => ({ q: pair.q.trim(), a: pair.a.trim() }))
      .filter((pair) => pair.q !== "" || pair.a !== "");
  }

  const faqJson = JSON.stringify(faq);
  const now = Math.floor(Date.now() / 1000);
  if (type === "products") {
    await db
      .prepare("UPDATE products SET faq = ?, updated_at = ? WHERE id = ?")
      .bind(faqJson, now, itemId)
      .run();
  } else {
    await db
      .prepare("UPDATE posts SET faq = ?, updated_at = ? WHERE id = ?")
      .bind(faqJson, now, itemId)
      .run();
  }

  return ctx.redirect(
    `/admin/faqs?type=${type}&item=${encodeURIComponent(itemId)}&saved=1`,
    303,
  );
};
