import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../lib/db";
import { CODE_RE } from "../../../lib/categories";

// 後臺「分類圖片」：每個 slot 一組 800 / 480 寬的 JPEG（瀏覽器端已裁成 4:5）。
// 網址記在 site_images；表由這裡自動建立，不需手動 migration。
const MAX = 2 * 1024 * 1024;
const PREFIX = "/api/images/";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function isJpeg(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}

// 只允許刪除自己建立的 site/cat_* 物件
function r2KeyFromUrl(url: string | null): string | null {
  if (!url || !url.startsWith(PREFIX)) return null;
  const key = url.slice(PREFIX.length);
  return key.startsWith("site/cat_") ? key : null;
}

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return json({ error: "Unauthorized" }, 401);
  const r2 = env.PRODUCT_IMAGES;
  if (!r2) return json({ error: "R2 not bound" }, 500);

  const form = await ctx.request.formData();
  const slotRaw = String(form.get("slot") ?? "");
  if (!CODE_RE.test(slotRaw)) {
    return json({ error: "Invalid slot" }, 400);
  }
  const dbKey = `cat_${slotRaw}`;

  const db = getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_images (
         key        TEXT PRIMARY KEY,
         url        TEXT NOT NULL,
         url_small  TEXT,
         updated_at INTEGER NOT NULL
       )`,
    )
    .run();

  const old = await db
    .prepare("SELECT url, url_small FROM site_images WHERE key = ?")
    .bind(dbKey)
    .first<{ url: string; url_small: string | null }>();
  const oldKeys = [
    r2KeyFromUrl(old?.url ?? null),
    r2KeyFromUrl(old?.url_small ?? null),
  ].filter((k): k is string => k !== null);

  if (String(form.get("_action") ?? "") === "reset") {
    await db.prepare("DELETE FROM site_images WHERE key = ?").bind(dbKey).run();
    if (oldKeys.length > 0) await r2.delete(oldKeys).catch(() => undefined);
    return json({ ok: true });
  }

  const big = form.get("image");
  const small = form.get("image_small");
  if (
    !(big instanceof File) ||
    !(small instanceof File) ||
    big.size === 0 ||
    small.size === 0
  ) {
    return json({ error: "Missing image" }, 400);
  }
  if (big.size > MAX || small.size > MAX) {
    return json({ error: "Image too large (max 2MB)" }, 413);
  }
  if (!(await isJpeg(big)) || !(await isJpeg(small))) {
    return json({ error: "Invalid image" }, 400);
  }

  const ts = Date.now();
  const bigKey = `site/${dbKey}/${ts}-800.jpg`;
  const smallKey = `site/${dbKey}/${ts}-480.jpg`;
  await r2.put(bigKey, big.stream(), {
    httpMetadata: { contentType: "image/jpeg" },
  });
  await r2.put(smallKey, small.stream(), {
    httpMetadata: { contentType: "image/jpeg" },
  });

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO site_images (key, url, url_small, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (key) DO UPDATE SET
         url = excluded.url,
         url_small = excluded.url_small,
         updated_at = excluded.updated_at`,
    )
    .bind(dbKey, `${PREFIX}${bigKey}`, `${PREFIX}${smallKey}`, now)
    .run();

  // 舊圖用新網址（時間戳）取代後，最佳努力清掉舊的 R2 物件
  const stale = oldKeys.filter((k) => k !== bigKey && k !== smallKey);
  if (stale.length > 0) await r2.delete(stale).catch(() => undefined);

  return json({ ok: true });
};
