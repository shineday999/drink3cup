import type { APIRoute } from "astro";
import { getDB } from "../../../../../lib/db";
import { checkReadiness } from "../../../../../lib/admin-products";

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const db = getDB();
  const existing = await db
    .prepare("SELECT status FROM products WHERE id = ?")
    .bind(id)
    .first<{ status: string }>();
  if (!existing) return new Response("Not found", { status: 404 });

  // 草稿 → 上架；上架 → 下架；下架 → 草稿（與按鈕文字一致）
  const next =
    existing.status === "draft"
      ? "active"
      : existing.status === "active"
        ? "archived"
        : "draft";

  if (next === "active") {
    const missing = await checkReadiness(db, id);
    if (missing.length > 0) {
      const msg = `还不能上架，缺少：${missing.join("、")}`;
      return ctx.redirect(
        `/admin/products/${id}?tab=variants&error=${encodeURIComponent(msg)}`,
        303,
      );
    }
  }

  await db
    .prepare("UPDATE products SET status = ?, updated_at = ? WHERE id = ?")
    .bind(next, Math.floor(Date.now() / 1000), id)
    .run();

  return ctx.redirect(`/admin/products/${id}?saved=1`, 303);
};
