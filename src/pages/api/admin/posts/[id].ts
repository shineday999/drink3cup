import type { APIRoute } from "astro";
import { getDB } from "../../../../lib/db";

const LOCALES = ["zh-Hant"] as const;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const form = await ctx.request.formData();
  const action = String(form.get("_action") ?? "meta");

  const db = getDB();

  if (action === "delete") {
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    return ctx.redirect("/admin/posts", 303);
  }

  if (action === "meta") {
    const category = String(form.get("category") ?? "") || null;
    const status = String(form.get("status") ?? "");
    const coverImageUrl = String(form.get("cover_image_url") ?? "") || null;
    const authorEmail = String(form.get("author_email") ?? "").trim() || null;

    if (!["draft", "published", "archived"].includes(status)) {
      return new Response("Invalid status", { status: 400 });
    }

    const existing = await db
      .prepare("SELECT status FROM posts WHERE id = ?")
      .bind(id)
      .first<{ status: string }>();
    const wasPublished = existing?.status === "published";
    const publishedAt =
      status === "published" && !wasPublished
        ? Math.floor(Date.now() / 1000)
        : null;

    await db
      .prepare(
        "UPDATE posts SET category = ?, status = ?, cover_image_url = ?, author_email = ?, published_at = COALESCE(?, published_at), updated_at = ? WHERE id = ?",
      )
      .bind(
        category,
        status,
        coverImageUrl,
        authorEmail,
        publishedAt,
        Math.floor(Date.now() / 1000),
        id,
      )
      .run();

    return ctx.redirect(`/admin/posts/${id}`, 303);
  }

  if (action === "translation") {
    const locale = String(form.get("locale") ?? "");
    const title = String(form.get("title") ?? "");
    const excerpt = String(form.get("excerpt") ?? "") || null;
    const bodyMarkdown = String(form.get("body_markdown") ?? "");

    if (!LOCALES.includes(locale as never))
      return new Response("Invalid locale", { status: 400 });
    if (!title || !bodyMarkdown)
      return new Response("Missing title or body", { status: 400 });

    await db
      .prepare(
        `INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (post_id, locale) DO UPDATE SET
           title = excluded.title,
           excerpt = excluded.excerpt,
           body_markdown = excluded.body_markdown`,
      )
      .bind(id, locale, title, excerpt, bodyMarkdown)
      .run();

    return ctx.redirect(`/admin/posts/${id}`, 303);
  }

  return new Response("Unknown action", { status: 400 });
};
