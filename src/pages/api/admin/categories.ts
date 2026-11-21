import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../lib/db";
import {
  CODE_RE,
  cleanTextMap,
  ensureCategoryTable,
} from "../../../lib/categories";

// 後臺「分類」：新增 / 儲存標題簡介排序 / 刪除。圖片上傳另見 category-images.ts。
const PREFIX = "/api/images/";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// 只允許刪除自己建立的 site/cat_* 物件
function r2KeyFromUrl(url: string | null): string | null {
  if (!url || !url.startsWith(PREFIX)) return null;
  const key = url.slice(PREFIX.length);
  return key.startsWith("site/cat_") ? key : null;
}

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await ctx.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }

  const db = getDB();
  await ensureCategoryTable(db);
  const action = String(body.action ?? "");
  const now = Math.floor(Date.now() / 1000);

  if (action === "create") {
    const code = String(body.code ?? "")
      .trim()
      .toLowerCase();
    if (!CODE_RE.test(code)) {
      return json(
        { error: "程式碼只能用小寫英文、數字、連字元（最長 30 字）" },
        400,
      );
    }
    const titles = cleanTextMap(body.titles, 60);
    if (!titles["zh-Hant"]) {
      return json({ error: "請填寫簡體中文標題" }, 400);
    }
    const exists = await db
      .prepare("SELECT 1 AS x FROM site_categories WHERE code = ?")
      .bind(code)
      .first();
    if (exists) return json({ error: "這個程式碼已經存在" }, 409);
    const max = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM site_categories")
      .first<{ m: number }>();
    await db
      .prepare(
        "INSERT INTO site_categories (code, sort_order, titles, descs, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(
        code,
        (max?.m ?? 0) + 1,
        JSON.stringify(titles),
        JSON.stringify(cleanTextMap(body.descs, 200)),
        now,
      )
      .run();
    return json({ ok: true });
  }

  if (action === "save") {
    const items = Array.isArray(body.items) ? body.items : [];
    for (const it of items) {
      const o = it as Record<string, unknown>;
      const code = String(o.code ?? "");
      if (!CODE_RE.test(code)) continue;
      const n = Number(o.sort_order);
      const sort = Number.isFinite(n) ? Math.trunc(n) : 0;
      await db
        .prepare(
          "UPDATE site_categories SET sort_order = ?, titles = ?, descs = ?, updated_at = ? WHERE code = ?",
        )
        .bind(
          sort,
          JSON.stringify(cleanTextMap(o.titles, 60)),
          JSON.stringify(cleanTextMap(o.descs, 200)),
          now,
          code,
        )
        .run();
    }
    return json({ ok: true });
  }

  if (action === "delete") {
    const code = String(body.code ?? "");
    if (!CODE_RE.test(code)) return json({ error: "Invalid code" }, 400);

    const total = await db
      .prepare("SELECT COUNT(*) AS n FROM site_categories")
      .first<{ n: number }>();
    if ((total?.n ?? 0) <= 1) {
      return json({ error: "至少要保留一個分類" }, 409);
    }

    try {
      const used = await db
        .prepare("SELECT COUNT(*) AS n FROM products WHERE category = ?")
        .bind(code)
        .first<{ n: number }>();
      if ((used?.n ?? 0) > 0) {
        return json(
          { error: `還有 ${used?.n} 個商品屬於這個分類，請先改掉它們的分類` },
          409,
        );
      }
    } catch {
      // products 查不到就不擋
    }

    const dbKey = `cat_${code}`;
    let keys: string[] = [];
    try {
      const img = await db
        .prepare("SELECT url, url_small FROM site_images WHERE key = ?")
        .bind(dbKey)
        .first<{ url: string; url_small: string | null }>();
      keys = [
        r2KeyFromUrl(img?.url ?? null),
        r2KeyFromUrl(img?.url_small ?? null),
      ].filter((k): k is string => k !== null);
      await db
        .prepare("DELETE FROM site_images WHERE key = ?")
        .bind(dbKey)
        .run();
    } catch {
      // site_images 還沒建立
    }
    await db
      .prepare("DELETE FROM site_categories WHERE code = ?")
      .bind(code)
      .run();
    const r2 = env.PRODUCT_IMAGES;
    if (r2 && keys.length > 0) await r2.delete(keys).catch(() => undefined);
    return json({ ok: true });
  }

  return json({ error: "Unknown action" }, 400);
};
