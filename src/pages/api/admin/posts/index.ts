import type { APIRoute } from "astro";
import { getDB, genId } from "../../../../lib/db";

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });

  const form = await ctx.request.formData();
  const slug = String(form.get("slug") ?? "");
  const category = String(form.get("category") ?? "") || null;
  const status = String(form.get("status") ?? "draft");

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  const db = getDB();
  const id = genId("post");
  const now = Math.floor(Date.now() / 1000);
  const publishedAt = status === "published" ? now : null;

  await db
    .prepare(
      "INSERT INTO posts (id, slug, status, category, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id, slug, status, category, publishedAt, now, now)
    .run();

  // Collect translations (form keys: translations[zh-Hant][title], etc.)
  const translationsMap = new Map<
    string,
    { title?: string; excerpt?: string; body_markdown?: string }
  >();
  for (const [key, value] of form.entries()) {
    const m = key.match(/^translations\[(.+?)\]\[(.+)\]$/);
    if (!m) continue;
    const locale = m[1] ?? "";
    const field = m[2] ?? "";
    if (!locale || !field) continue;
    const cur = translationsMap.get(locale) ?? {};
    (cur as Record<string, string>)[field] = String(value);
    translationsMap.set(locale, cur);
  }

  for (const [locale, fields] of translationsMap) {
    if (!fields.title || !fields.body_markdown) continue;
    await db
      .prepare(
        "INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(
        id,
        locale,
        fields.title,
        fields.excerpt ?? null,
        fields.body_markdown,
      )
      .run();
  }

  return ctx.redirect(`/admin/posts/${id}`, 303);
};
