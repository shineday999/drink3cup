// Quiz recommendation endpoint — Phase 3 簡化版
// Phase 5 之後可改用 quiz_rules 表 + 預寫產品文案

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { scoreProducts } from "../../../lib/quiz";
import { kindOf } from "../../../lib/category-kind";

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  const type = String(form.get("type") ?? "");
  if (type !== "jewelry" && type !== "incense" && type !== "tea") {
    return new Response("Invalid quiz type", { status: 400 });
  }

  // 商品分類代碼：jewelry / incense 固定；tea 用後台「分类图片」裡那個茶葉分類的實際代碼
  let category: string = type;
  if (type === "tea") {
    category = "";
    const wanted = String(form.get("cat") ?? "tea");
    if (env?.DB) {
      const rows = await env.DB.prepare(
        "SELECT code, titles FROM site_categories",
      )
        .all<{ code: string; titles: string }>()
        .catch(() => ({
          results: [] as Array<{ code: string; titles: string }>,
        }));
      for (const r of rows.results ?? []) {
        let zh: string | undefined;
        try {
          zh = (JSON.parse(r.titles) as Record<string, string>)["zh-Hans"];
        } catch {
          zh = undefined;
        }
        if (r.code === wanted && kindOf(r.code, zh) === "tea")
          category = r.code;
      }
    }
    if (!category) return new Response("Invalid category", { status: 400 });
  }

  // Collect answers
  const answers: Record<string, string | string[]> = {};
  for (const [key, val] of form.entries()) {
    const m = key.match(/^answers\[(.+)\]$/);
    if (!m) continue;
    const k = m[1] ?? "";
    const v = String(val);
    if (!k) continue;
    if (answers[k] === undefined) answers[k] = v;
    else if (Array.isArray(answers[k])) (answers[k] as string[]).push(v);
    else answers[k] = [answers[k] as string, v];
  }

  // Load active products
  const products = env?.DB
    ? await env.DB.prepare(
        `SELECT p.id, p.slug, pt.name, p.tags
           FROM products p
           LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.locale = ?
           WHERE p.category = ? AND p.status = 'active'
           LIMIT 50`,
      )
        .bind(ctx.locals.locale, category)
        .all<{
          id: string;
          slug: string;
          name: string | null;
          tags: string | null;
        }>()
    : {
        results: [] as Array<{
          id: string;
          slug: string;
          name: string | null;
          tags: string | null;
        }>,
      };

  const list = (products.results ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name ?? r.slug,
    tags: r.tags ?? "",
  }));

  const scored = scoreProducts(type, answers, list);
  const ids = scored.map((s) => s.id).join(",");
  const scores = scored.map((s) => `${s.id}:${s.score}`).join(",");

  return ctx.redirect(
    `/quiz/result?type=${type}&ids=${encodeURIComponent(ids)}&scores=${encodeURIComponent(scores)}`,
    303,
  );
};
