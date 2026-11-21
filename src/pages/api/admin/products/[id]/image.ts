import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../../../lib/db";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX = 5 * 1024 * 1024;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = ctx.params.id;
  const r2 = env.PRODUCT_IMAGES;
  if (!r2) return new Response("R2 not bound", { status: 500 });

  const form = await ctx.request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return new Response("No file", { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return new Response("Invalid image type", { status: 400 });
  }
  if (file.size > MAX) {
    return new Response("Image too large (max 5MB)", { status: 413 });
  }

  const ext = EXT[file.type] ?? "jpg";
  const key = `products/${id}/cover-${Date.now()}.${ext}`;
  await r2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  const url = `/api/images/${key}`;
  const now = Math.floor(Date.now() / 1000);

  const db = getDB();
  await db
    .prepare("UPDATE products SET image_url = ?, updated_at = ? WHERE id = ?")
    .bind(url, now, id)
    .run();

  return ctx.redirect(`/admin/products/${id}`, 303);
};
