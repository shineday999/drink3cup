import type { APIRoute } from "astro";
import { getDB } from "../../../../../lib/db";
import {
  buildTags,
  checkReadiness,
  isCategory,
  splitTags,
} from "../../../../../lib/admin-products";

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const form = await ctx.request.formData();
  const db = getDB();

  // 刪除放在最前面：刪除表單只送 _action，不該被後面的欄位驗證擋掉
  // （FK CASCADE：規格、翻譯、價格、評論一併刪除）
  if (String(form.get("_action") ?? "") === "delete") {
    await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return ctx.redirect("/admin/products", 303);
  }

  const fail = (msg: string) =>
    ctx.redirect(`/admin/products/${id}?error=${encodeURIComponent(msg)}`, 303);

  const category = String(form.get("category") ?? "");
  const subcategory = String(form.get("subcategory") ?? "").trim() || null;
  const slug = String(form.get("slug") ?? "");
  const status = String(form.get("status") ?? "");

  if (!isCategory(category)) return fail("分类不正确");
  if (!["draft", "active", "archived"].includes(status))
    return fail("状态不正确");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return fail("编号格式不正确");

  const existing = await db
    .prepare("SELECT status FROM products WHERE id = ?")
    .bind(id)
    .first<{ status: string }>();
  if (!existing) return new Response("Not found", { status: 404 });

  const dup = await db
    .prepare("SELECT id FROM products WHERE slug = ? AND id <> ?")
    .bind(slug, id)
    .first();
  if (dup) return fail("这个编号已被其他商品使用");

  // 改成「上架」前先檢查資料齊不齊（與前台實際讀取的資料一致）
  if (status === "active" && existing.status !== "active") {
    const missing = await checkReadiness(db, id);
    if (missing.length > 0) {
      return fail(`还不能上架，缺少：${missing.join("、")}`);
    }
  }

  // 標籤：新表單送 tag（勾選）+ tags_extra（舊資料保留）；舊表單才會送 tags
  const tags = form.has("tags_extra")
    ? buildTags(
        category,
        form.getAll("tag").map(String),
        splitTags(String(form.get("tags_extra") ?? "")),
      )
    : String(form.get("tags") ?? "").trim();

  await db
    .prepare(
      "UPDATE products SET category = ?, subcategory = ?, slug = ?, status = ?, tags = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      category,
      subcategory,
      slug,
      status,
      tags,
      Math.floor(Date.now() / 1000),
      id,
    )
    .run();

  return ctx.redirect(`/admin/products/${id}?tab=core&saved=1`, 303);
};
