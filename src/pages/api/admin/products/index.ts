import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB, genId } from "../../../../lib/db";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const r2 = env.PRODUCT_IMAGES;
  const form = await ctx.request.formData();

  const category = String(form.get("category") ?? "");
  const subcategory = String(form.get("subcategory") ?? "") || null;
  const slug = String(form.get("slug") ?? "");
  const tags = String(form.get("tags") ?? "").trim();

  if (!category || !slug || !["beans", "brewing"].includes(category)) {
    return new Response("Invalid input", { status: 400 });
  }

  const db = getDB();
  const id = genId("prod");
  const now = Math.floor(Date.now() / 1000);

  // Handle image upload to R2 (optional)
  let imageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return new Response("Invalid image type", { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return new Response("Image too large (max 5MB)", { status: 413 });
    }
    const ext = IMAGE_EXT[file.type] ?? "jpg";
    const key = `products/${id}/cover.${ext}`;
    if (r2) {
      await r2.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      imageUrl = `/api/images/${key}`;
    }
  }

  await db
    .prepare(
      "INSERT INTO products (id, category, subcategory, slug, status, image_url, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id, category, subcategory, slug, "draft", imageUrl, tags, now, now)
    .run();

  // Initial zh-Hant translation if provided
  const name = String(form.get("translations[zh-Hant][name]") ?? "");
  const description = String(
    form.get("translations[zh-Hant][description]") ?? "",
  );
  if (name && description) {
    await db
      .prepare(
        "INSERT INTO product_translations (product_id, locale, name, description) VALUES (?, ?, ?, ?)",
      )
      .bind(id, "zh-Hant", name, description)
      .run();
  }

  return ctx.redirect(`/admin/products/${id}`, 303);
};
