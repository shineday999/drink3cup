// /api/admin/settings — Wave 28.7d POST handler
// 接收 12 個 form field (3 keys × 4 locales,`{key}__{locale}`),
// 批次 UPSERT 到 site_settings。空白 value 不寫入,避免覆蓋既有非空翻譯。
import type { APIRoute } from "astro";
import { getDB } from "../../../lib/db";
import { invalidateSiteSettings } from "../../../lib/site-settings-cache";

const ALLOWED_KEYS = [
  "site_name",
  "theme",
  "sub_theme",
  "hero_subtitle",
] as const;
const ALLOWED_LOCALES = ["zh-Hant"] as const;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await ctx.request.formData();
  const db = getDB();
  const now = Math.floor(Date.now() / 1000);
  const adminEmail = ctx.locals.admin.email;

  const stmts: D1PreparedStatement[] = [];
  for (const key of ALLOWED_KEYS) {
    for (const locale of ALLOWED_LOCALES) {
      const fieldName = `${key}__${locale}`;
      const raw = form.get(fieldName);
      const value = String(raw ?? "").trim();
      if (!value) continue;
      stmts.push(
        db
          .prepare(
            "INSERT INTO site_settings (key, locale, value, updated_at, updated_by) VALUES (?, ?, ?, ?, ?) " +
              "ON CONFLICT(key, locale) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by",
          )
          .bind(key, locale, value, now, adminEmail),
      );
    }
  }

  if (stmts.length > 0) {
    await db.batch(stmts);
    invalidateSiteSettings();
  }

  return ctx.redirect("/admin/settings?saved=1", 303);
};
