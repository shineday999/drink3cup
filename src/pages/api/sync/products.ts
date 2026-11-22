import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  SYNC_HEADERS,
  exportRows,
  importRow,
  type ImportResult,
} from "../../../lib/sheet-sync-api";

// GET  /api/sync/products  → { headers, rows }   全部商品(給 Apps Script 比對)
// POST /api/sync/products  → { results }         寫入表格改過的列(一次最多 25 列)
// 以 Authorization: Bearer <SYNC_TOKEN> 驗證;SYNC_TOKEN 是 Cloudflare Pages secret。
export const prerender = false;

const MAX_ROWS = 25;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function checkAuth(request: Request): Response | null {
  const token = (env as unknown as Record<string, string | undefined>)
    .SYNC_TOKEN;
  if (!token || token.length < 24) {
    return json({ error: "SYNC_TOKEN 尚未設定" }, 503);
  }
  const h = request.headers.get("authorization") ?? "";
  const given = h.startsWith("Bearer ") ? h.slice(7) : "";
  let diff = given.length ^ token.length;
  for (let i = 0; i < token.length; i++) {
    diff |= (given.charCodeAt(i) || 0) ^ token.charCodeAt(i);
  }
  return diff === 0 ? null : json({ error: "unauthorized" }, 401);
}

export const GET: APIRoute = async ({ request }) => {
  const denied = checkAuth(request);
  if (denied) return denied;
  return json({ headers: SYNC_HEADERS, rows: await exportRows() });
};

export const POST: APIRoute = async ({ request }) => {
  const denied = checkAuth(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "不是有效的 JSON" }, 400);
  }
  const rows = (body as { rows?: unknown } | null)?.rows;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ROWS) {
    return json({ error: `rows 必須是 1 到 ${MAX_ROWS} 筆` }, 400);
  }

  const results: ImportResult[] = [];
  for (const r of rows) {
    const rec = (r ?? {}) as Record<string, unknown>;
    try {
      results.push(await importRow(rec));
    } catch (e) {
      results.push({
        slug: String(rec.slug ?? ""),
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const okSlugs = results.filter((x) => x.ok).map((x) => x.slug);
  const fresh = new Map<string, unknown>();
  if (okSlugs.length > 0) {
    for (const r of await exportRows(okSlugs)) fresh.set(String(r.slug), r);
  }
  return json({
    results: results.map((x) => ({
      ...x,
      row: x.ok ? fresh.get(x.slug) : undefined,
    })),
  });
};
