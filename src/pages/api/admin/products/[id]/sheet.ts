import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../../../lib/db";
import { findProductRow, parseCsv } from "../../../../../lib/sheet-sync";

// GET /api/admin/products/:id/sheet
// 讀取「發布到網路」的 Google 試算表（CSV），回傳這個商品那一列的簡介／描述（4 種語言）。
// 只讀取、不寫入資料庫；由後台翻譯頁的按鈕呼叫，填進欄位後仍需按「保存全部」。
// 注意：上游（Google）出問題時不要回 502／504——Cloudflare 會把它換成自己的錯誤頁，看不到訊息；改用 424。
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: "未登录" }, 401);

  const sheetUrl = (env as unknown as Record<string, string | undefined>)
    .PRODUCT_SHEET_CSV_URL;
  if (!sheetUrl) {
    return json(
      {
        error:
          "还没有设置表格网址（PRODUCT_SHEET_CSV_URL），请先照 docs/PRODUCT-SHEET-SYNC.md 设置",
      },
      503,
    );
  }

  let url: URL;
  try {
    url = new URL(sheetUrl.trim());
  } catch {
    return json({ error: "PRODUCT_SHEET_CSV_URL 不是有效的网址" }, 500);
  }
  if (url.protocol !== "https:" || url.hostname !== "docs.google.com") {
    return json(
      { error: "PRODUCT_SHEET_CSV_URL 必须是 docs.google.com 的 https 网址" },
      500,
    );
  }
  // 网址里「?」后面的部分不是机密，出错时显示出来方便检查
  const query = url.search || "（没有参数）";
  if (url.searchParams.get("output") !== "csv") {
    return json(
      {
        error: `表格网址缺少 output=csv（目前参数：${query}）。请在「发布到网络」里选「逗号分隔值 (.csv)」，重新设置 secret`,
      },
      424,
    );
  }

  const product = await getDB()
    .prepare("SELECT slug FROM products WHERE id = ?")
    .bind(params.id ?? "")
    .first<{ slug: string }>();
  if (!product) return json({ error: "找不到这个商品" }, 404);

  let text: string;
  let contentType = "";
  try {
    const res = await fetch(url.toString(), { redirect: "follow" });
    contentType = res.headers.get("content-type") ?? "";
    if (!res.ok) {
      return json(
        {
          error: `读取表格失败：Google 回应 ${res.status}（参数：${query}），请确认已「发布到网络」`,
        },
        424,
      );
    }
    text = await res.text();
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e);
    return json({ error: `读取表格失败：${why}` }, 424);
  }
  if (text.trimStart().startsWith("<")) {
    return json(
      {
        error: `读到的不是 CSV（${contentType || "未知格式"}，参数：${query}），请确认表格已「发布到网络」并选择 CSV 格式`,
      },
      424,
    );
  }

  const result = findProductRow(parseCsv(text), product.slug);
  if (!result.ok) {
    const msg =
      result.error === "not_found"
        ? `表格里找不到这个商品的编号：${product.slug}（slug 栏要和后台一致）`
        : result.error === "no_slug_column"
          ? "表格第一列找不到「slug」栏"
          : "表格是空的";
    return json({ error: msg }, result.error === "not_found" ? 404 : 422);
  }

  return json({
    ok: true,
    fills: result.fills,
    filled: result.filled,
    missing: result.missing,
  });
};
