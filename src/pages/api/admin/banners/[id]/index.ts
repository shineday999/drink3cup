import { env } from "cloudflare:workers";
import type { APIRoute, APIContext } from "astro";
import { getDB } from "../../../../../lib/db";

async function doPatch(ctx: APIContext, form: FormData) {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const altText = String(form.get("alt_text") ?? "").trim() || null;
  const sortOrder = Number(form.get("sort_order") ?? 0);
  const activeRaw = form.get("active");
  const active =
    activeRaw === null || activeRaw === "" || activeRaw === "1" ? 1 : 0;
  const clearMobile = form.get("clear_mobile") === "1";

  const db = getDB();
  const r2 = env.PRODUCT_IMAGES;
  const now = Math.floor(Date.now() / 1000);

  let mobileUrl: string | null | undefined = undefined;
  if (clearMobile) {
    mobileUrl = null;
    if (r2) {
      const existing = await db
        .prepare("SELECT mobile_image_url FROM hero_banners WHERE id = ?")
        .bind(id)
        .first<{ mobile_image_url: string | null }>();
      if (existing?.mobile_image_url?.startsWith("/api/images/")) {
        try {
          await r2.delete(
            existing.mobile_image_url.replace(/^\/api\/images\//, ""),
          );
        } catch {
          // R2 deletion failure should not block DB update
        }
      }
    }
  }
  const mobileFile = form.get("mobile_image");
  if (mobileFile instanceof File && mobileFile.size > 0) {
    if (!r2) return new Response("R2 not bound", { status: 500 });
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);
    if (!allowed.has(mobileFile.type)) {
      return new Response("Invalid mobile image type", { status: 400 });
    }
    if (mobileFile.size > 10 * 1024 * 1024) {
      return new Response("Mobile image too large (max 10MB)", { status: 413 });
    }
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extMap[mobileFile.type] ?? "jpg";
    const key = `banners/${id}/mobile-${now}.${ext}`;
    await r2.put(key, mobileFile.stream(), {
      httpMetadata: { contentType: mobileFile.type },
    });
    mobileUrl = `/api/images/${key}`;
  }

  if (mobileUrl !== undefined) {
    await db
      .prepare(
        "UPDATE hero_banners SET alt_text = ?, sort_order = ?, active = ?, mobile_image_url = ?, updated_at = ? WHERE id = ?",
      )
      .bind(altText, sortOrder, active, mobileUrl, now, id)
      .run();
  } else {
    await db
      .prepare(
        "UPDATE hero_banners SET alt_text = ?, sort_order = ?, active = ?, updated_at = ? WHERE id = ?",
      )
      .bind(altText, sortOrder, active, now, id)
      .run();
  }

  return ctx.redirect("/admin/banners", 303);
}

async function doDelete(ctx: APIContext) {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const db = getDB();
  const r2 = env.PRODUCT_IMAGES;

  const existing = await db
    .prepare("SELECT image_url FROM hero_banners WHERE id = ?")
    .bind(id)
    .first<{ image_url: string }>();

  await db.prepare("DELETE FROM hero_banners WHERE id = ?").bind(id).run();

  if (existing && r2 && existing.image_url.startsWith("/api/images/")) {
    const key = existing.image_url.replace(/^\/api\/images\//, "");
    try {
      await r2.delete(key);
    } catch {
      // R2 deletion failure should not block DB delete
    }
  }

  return new Response(null, {
    status: 303,
    headers: { Location: "/admin/banners" },
  });
}

export const PATCH: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  return doPatch(ctx, form);
};

export const DELETE: APIRoute = doDelete;

// Form-based method override: HTML <form method="POST"> cannot natively
// submit PATCH or DELETE, so we honor a hidden _method field as a
// method-override convention (similar to Rails / Laravel / Express
// method-override middleware). This is what /admin/banners toggle and
// delete buttons rely on — see src/pages/admin/banners/index.astro.
// Before this fix the toggle button POSTed to /api/admin/banners/[id]
// without a POST handler, so Astro fell through to the 404 page.
export const POST: APIRoute = async (ctx) => {
  let form: FormData;
  try {
    form = await ctx.request.formData();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  const override = String(form.get("_method") ?? "")
    .trim()
    .toUpperCase();
  if (override === "PATCH") return doPatch(ctx, form);
  if (override === "DELETE") return doDelete(ctx);
  return new Response("Method Not Allowed", { status: 405 });
};
